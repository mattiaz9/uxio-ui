#!/usr/bin/env node
/**
 * Build uxio registry with shadcn-style structure: styles/{style}/{name}.json
 *
 * Auto-discovers components from registry/uxio/ directory structure and reads
 * shared config from registry/uxio/registry.config.json.
 *
 * Directory conventions:
 *   overrides-{name}-base/   → Base UI variant
 *   overrides-{name}-radix/  → Radix variant
 *   overrides-{name}/        → Shared (same for all bases)
 *
 * Config drives: title, description, dependencies, registryDependencies,
 * css, cssVars, categories.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import chalk from "chalk"
import { createStyleMap, transformStyle } from "shadcn/utils"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const OUTPUT = resolve(ROOT, "public/r")
const REGISTRY_STYLES = resolve(ROOT, "registry/styles")
const REGISTRY_COMPONENTS = resolve(ROOT, "registry/uxio")
const EXAMPLES_DIR = resolve(ROOT, "src/examples")
const CONFIG_PATH = resolve(REGISTRY_COMPONENTS, "registry.config.json")

const STYLES = [
  "base-nova",
  "radix-nova",
  "base-vega",
  "radix-vega",
  "base-maia",
  "radix-maia",
  "base-lyra",
  "radix-lyra",
  "base-mira",
  "radix-mira",
] as const

const BASES = ["base", "radix"] as const
const DEFAULT_STYLE = "nova"

// ---------------------------------------------------------------------------
// Config types
// ---------------------------------------------------------------------------

interface ItemConfig {
  name: string
  type?: "registry:ui" | "registry:style"
  title: string
  description: string | { base: string; radix: string }
  categories?: string[]
  dependencies?: string[] | { base: string[]; radix: string[] }
  registryDependencies?: string[]
  cssVars?: {
    theme?: Record<string, string>
    light?: Record<string, string>
    dark?: Record<string, string>
  }
  css?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Directory scanning
// ---------------------------------------------------------------------------

interface ComponentDirs {
  shared?: string
  base?: string
  radix?: string
}

function scanComponents(): Map<string, ComponentDirs> {
  const map = new Map<string, ComponentDirs>()
  const dirs = readdirSync(REGISTRY_COMPONENTS, { withFileTypes: true }).filter(
    (d) => d.isDirectory() && d.name.startsWith("overrides-"),
  )

  for (const d of dirs) {
    const withoutPrefix = d.name.replace(/^overrides-/, "")
    let name: string
    let variant: "shared" | "base" | "radix"

    if (withoutPrefix.endsWith("-base")) {
      name = withoutPrefix.replace(/-base$/, "")
      variant = "base"
    } else if (withoutPrefix.endsWith("-radix")) {
      name = withoutPrefix.replace(/-radix$/, "")
      variant = "radix"
    } else {
      name = withoutPrefix
      variant = "shared"
    }

    if (!map.has(name)) map.set(name, {})
    map.get(name)![variant] = d.name
  }

  return map
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBaseForStyle(style: string): "base" | "radix" {
  return style.startsWith("base-") ? "base" : "radix"
}

function getStyleName(style: string): string {
  return style.replace(/^(base|radix)-/, "")
}

function getDependencies(config: ItemConfig, base: "base" | "radix"): string[] {
  if (!config.dependencies) return []
  if (Array.isArray(config.dependencies)) return config.dependencies
  return config.dependencies[base] ?? []
}

function getDescription(config: ItemConfig, base: "base" | "radix"): string {
  if (typeof config.description === "string") return config.description
  return config.description[base]
}

function getIndexDescription(config: ItemConfig): string {
  if (typeof config.description === "string") return config.description
  return config.description.base
}

/**
 * Rewrite `@/registry/uxio/overrides-…/file` imports.
 * - consumer: → `@/components/ui/file`  (what end-users receive)
 * - example:  → `./file`                (local examples folder)
 */
function rewriteRegistryImports(content: string, mode: "consumer" | "example"): string {
  const replacement = mode === "consumer" ? "@/components/ui/$1" : "./$1"
  return content.replace(/@\/registry\/uxio\/overrides-[^/]+\/([^"']+)/g, replacement)
}

/**
 * Rewrite @/components/ui/{name} to ./{name} for registry components when copying to examples.
 */
function rewriteComponentsUiForExamples(content: string, registryNames: Set<string>): string {
  let result = content
  for (const name of registryNames) {
    result = result.replace(
      new RegExp(`from\\s*["']@/components/ui/${name}["']`, "g"),
      `from "./${name}"`,
    )
  }
  return result
}

function readComponentFiles(dirPath: string): Array<{ filename: string; content: string }> {
  return readdirSync(dirPath)
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .map((f) => ({
      filename: f,
      content: readFileSync(resolve(dirPath, f), "utf-8"),
    }))
}

// ---------------------------------------------------------------------------
// Registry item types
// ---------------------------------------------------------------------------

interface RegistryItem {
  $schema: string
  name: string
  type: "registry:ui"
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: Array<{ path: string; content: string; type: "registry:ui" }>
  categories: string[]
  cssVars?: { theme?: Record<string, string> }
  css?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Build a single registry item for a given style
// ---------------------------------------------------------------------------

async function buildItem(
  config: ItemConfig,
  dirs: ComponentDirs,
  allDirs: Map<string, ComponentDirs>,
  style: string,
  styleMap: ReturnType<typeof createStyleMap>,
): Promise<RegistryItem> {
  const base = getBaseForStyle(style)
  const dirName = dirs[base] ?? dirs.shared
  if (!dirName) {
    throw new Error(`No directory found for "${config.name}" (${base})`)
  }

  const dirPath = resolve(REGISTRY_COMPONENTS, dirName)
  const sourceFiles = readComponentFiles(dirPath)

  const files: RegistryItem["files"] = []
  for (const { filename, content: raw } of sourceFiles) {
    let content = await transformStyle(raw, { styleMap })
    content = rewriteRegistryImports(content, "consumer")
    files.push({
      path: `components/ui/${filename}`,
      content,
      type: "registry:ui",
    })
  }

  for (const depName of config.registryDependencies ?? []) {
    const depDirs = allDirs.get(depName)
    if (!depDirs) continue
    const depDirName = depDirs[base] ?? depDirs.shared
    if (!depDirName) continue
    const depPath = resolve(REGISTRY_COMPONENTS, depDirName)
    for (const { filename, content } of readComponentFiles(depPath)) {
      if (files.some((f) => f.path === `components/ui/${filename}`)) continue
      files.push({ path: `components/ui/${filename}`, content, type: "registry:ui" })
    }
  }

  const item: RegistryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: config.name,
    type: "registry:ui",
    title: config.title,
    description: getDescription(config, base),
    dependencies: getDependencies(config, base),
    registryDependencies: config.registryDependencies ?? [],
    files,
    categories: config.categories ?? [],
  }

  if (config.cssVars) item.cssVars = config.cssVars
  if (config.css) item.css = config.css
  return item
}

// ---------------------------------------------------------------------------
// Copy nova-styled components into src/examples/{base}/ui/ for docs previews
// ---------------------------------------------------------------------------

async function copyUIToExamples(allDirs: Map<string, ComponentDirs>) {
  const styleCss = readFileSync(resolve(REGISTRY_STYLES, `style-${DEFAULT_STYLE}.css`), "utf-8")
  const styleMap = createStyleMap(styleCss)
  const registryNames = new Set(allDirs.keys())

  for (const base of BASES) {
    const targetDir = resolve(EXAMPLES_DIR, base, "ui")
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }

    for (const [, dirs] of allDirs) {
      const dirName = dirs[base] ?? dirs.shared
      if (!dirName) continue

      const srcDir = resolve(REGISTRY_COMPONENTS, dirName)
      for (const f of readdirSync(srcDir).filter((n) => n.endsWith(".tsx") || n.endsWith(".ts"))) {
        const source = readFileSync(resolve(srcDir, f), "utf-8")
        let content = await transformStyle(source, { styleMap })
        content = rewriteRegistryImports(content, "example")
        content = rewriteComponentsUiForExamples(content, registryNames)
        writeFileSync(resolve(targetDir, f), content)
      }
    }

    console.log(`  ${chalk.green("➜")}  ${chalk.bold("Copied:")}   ${chalk.cyan(`${base}/ui/`)}`)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const configs: ItemConfig[] = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"))
  const allDirs = scanComponents()

  for (const style of STYLES) {
    const outDir = resolve(OUTPUT, "styles", style)
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true })
    }

    const styleName = getStyleName(style)
    const styleCssPath = resolve(REGISTRY_STYLES, `style-${styleName}.css`)
    if (!existsSync(styleCssPath)) {
      throw new Error(`Style CSS not found: ${styleCssPath}`)
    }
    const styleCss = readFileSync(styleCssPath, "utf-8")
    const styleMap = createStyleMap(styleCss)
    const base = getBaseForStyle(style)

    for (const config of configs) {
      const itemType = config.type ?? "registry:ui"

      if (itemType === "registry:style") {
        const styleItem = {
          $schema: "https://ui.shadcn.com/schema/registry-item.json",
          name: config.name,
          type: "registry:style" as const,
          title: config.title,
          description:
            typeof config.description === "string" ? config.description : config.description.base,
          categories: config.categories ?? [],
          ...(config.cssVars && { cssVars: config.cssVars }),
          ...(config.css && { css: config.css }),
        }
        writeFileSync(resolve(outDir, `${config.name}.json`), JSON.stringify(styleItem, null, 2))
        console.log(
          `  ${chalk.green("➜")}  ${chalk.bold("Built:")}   ${chalk.cyan(`${style}/${config.name}.json`)}`,
        )
        continue
      }

      const dirs = allDirs.get(config.name)
      if (!dirs) {
        console.warn(`  ${chalk.yellow("⚠")}  No directory found for "${config.name}", skipping`)
        continue
      }
      if (!dirs.shared && !dirs[base]) continue

      const item = await buildItem(config, dirs, allDirs, style, styleMap)
      writeFileSync(resolve(outDir, `${config.name}.json`), JSON.stringify(item, null, 2))
      console.log(
        `  ${chalk.green("➜")}  ${chalk.bold("Built:")}   ${chalk.cyan(`${style}/${config.name}.json`)}`,
      )
    }
  }

  const registryIndex = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "uxio",
    homepage: "https://ui.uxio.dev",
    items: configs.map((c) => ({
      name: c.name,
      type: (c.type ?? "registry:ui") as "registry:ui" | "registry:style",
      title: c.title,
      description: getIndexDescription(c),
      categories: c.categories ?? [],
    })),
  }

  writeFileSync(resolve(OUTPUT, "registry.json"), JSON.stringify(registryIndex, null, 2))
  console.log(`  ${chalk.green("➜")}  ${chalk.bold("Built:")}   ${chalk.cyan("registry.json")}`)

  await copyUIToExamples(allDirs)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
