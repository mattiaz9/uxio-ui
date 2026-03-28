#!/usr/bin/env node
/**
 * Build uxio registry with shadcn-style structure: styles/{style}/{name}.json
 *
 * Auto-discovers components from registry/uxio/ directory structure and reads
 * shared config from registry/uxio/registry.config.json.
 *
 * Directory conventions:
 *   overrides-{name}-base/   → Base UI variant (overrides category)
 *   overrides-{name}-radix/  → Radix variant
 *   overrides-{name}/        → Shared (same for all bases)
 *   inputs-{name}-base/      → Base UI variant (inputs category)
 *   inputs-{name}-radix/     → Radix variant
 *   layers-{name}-base/      → Base UI variant (layers category)
 *   layers-{name}-radix/     → Radix variant
 *   layers-{name}/           → Shared layers component
 *
 * Meta items: `categories` includes `meta`, no source folder. Emits `registry:ui` JSON with
 * `files: []` and `registryDependencies` only (shadcn CLI installs each dependency recursively).
 *
 * Config drives: title, description, dependencies, registryDependencies,
 * css, cssVars, categories.
 *
 * Shared helpers under `registry/lib/` are imported as `@/registry/lib/…`. The build merges them
 * into each published item with `path` `lib/…`, `type` `registry:lib`, and imports rewritten to
 * `@/lib/…`. (Using `registry:ui` for those files makes the shadcn CLI write them under
 * `components/ui` instead of `lib`.) Optional `files` in config (shadcn shape: `path` + `type`, omit
 * `content`) lists extra `registry:lib` entries under `registry/lib/` to merge when not pulled in via imports.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs"
import { resolve, dirname, relative } from "path"
import { fileURLToPath } from "url"
import chalk from "chalk"
import { createStyleMap, transformStyle } from "shadcn/utils"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const OUTPUT = resolve(ROOT, "public/r")
const REGISTRY_STYLES = resolve(ROOT, "registry/styles")
const REGISTRY_COMPONENTS = resolve(ROOT, "registry/uxio")
const REGISTRY_LIB = resolve(ROOT, "registry/lib")
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
  /** Extra files to merge (shadcn `files` shape; omit `content` — filled at build). Use `type: registry:lib` and `path` like `lib/foo.ts`. */
  files?: Array<{ path: string; type: "registry:lib" | "registry:ui" }>
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
    (d) =>
      d.isDirectory() &&
      (d.name.startsWith("overrides-") ||
        d.name.startsWith("layers-") ||
        d.name.startsWith("inputs-")),
  )

  for (const d of dirs) {
    const withoutPrefix = d.name.replace(/^(overrides|layers|inputs)-/, "")
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
    // oxlint-disable-next-line typescript/no-non-null-assertion
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

/** `@uxio/name` in config maps to the same keys as bare `name` for component dirs. */
function stripRegistryScope(dep: string): string {
  return dep.startsWith("@uxio/") ? dep.slice("@uxio/".length) : dep
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
 * Rewrite `@/registry/uxio/overrides-…/file`, `inputs-…/file`, and `layers-…/file` imports.
 * - consumer: → `@/components/ui/file`  (what end-users receive)
 * - example:  → `./file`                (local examples folder)
 */
function rewriteRegistryImports(content: string, mode: "consumer" | "example"): string {
  const replacement = mode === "consumer" ? "@/components/ui/$1" : "./$1"
  return content.replace(
    /@\/registry\/uxio\/(?:overrides|layers|inputs)-[^/]+\/([^"']+)/g,
    replacement,
  )
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

function resolveRegistryLibFile(cleanPath: string): string | null {
  const base = cleanPath.replace(/\.(ts|tsx)$/, "")
  const absTs = resolve(REGISTRY_LIB, `${base}.ts`)
  if (existsSync(absTs)) return absTs
  const absTsx = resolve(REGISTRY_LIB, `${base}.tsx`)
  if (existsSync(absTsx)) return absTsx
  return null
}

/** Config `files` entry: `lib/…` is the published path; also accepts paths relative to `registry/lib/`. */
function resolveConfigRegistryLibFile(path: string): string | null {
  const clean = path.startsWith("lib/") ? path.slice(4) : path
  return resolveRegistryLibFile(clean)
}

/** Import specifiers like `numbers` or `currency` (no `@/registry/lib` prefix). */
function collectRegistryLibImportsFromContent(content: string): string[] {
  const out: string[] = []
  const re = /@\/registry\/lib\/([^"'`]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const g = m[1]
    if (g) out.push(g.replace(/\.(ts|tsx)$/, ""))
  }
  return out
}

/** Walk `@/registry/lib/…` imports recursively; keys are paths relative to `registry/lib` (e.g. `numbers.ts`). */
function collectRegistryLibRecursive(initialContents: string[]): Map<string, string> {
  const result = new Map<string, string>()
  const queue: string[] = [...initialContents]
  const seen = new Set<string>()

  while (queue.length > 0) {
    const content = queue.pop()
    if (content === undefined) break
    for (const imp of collectRegistryLibImportsFromContent(content)) {
      if (seen.has(imp)) continue
      seen.add(imp)
      const abs = resolveRegistryLibFile(imp)
      if (!abs) {
        throw new Error(`Missing registry lib file for import "@/registry/lib/${imp}"`)
      }
      const rel = relative(REGISTRY_LIB, abs).replace(/\\/g, "/")
      if (result.has(rel)) continue
      const raw = readFileSync(abs, "utf-8")
      result.set(rel, raw)
      queue.push(raw)
    }
  }
  return result
}

/**
 * `@/registry/lib/foo` → `@/lib/foo` (consumer) or `../lib/foo` (example, from `examples/.../ui/`).
 */
function rewriteRegistryLibImports(content: string, mode: "consumer" | "example"): string {
  return content.replace(/@\/registry\/lib\/([^"'`]+)/g, (_, spec: string) => {
    const clean = spec.replace(/\.(ts|tsx)$/, "")
    if (mode === "consumer") return `@/lib/${clean}`
    return `../lib/${clean}`
  })
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
  files: Array<{ path: string; content: string; type: "registry:ui" | "registry:lib" }>
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

  const initialLibScan: string[] = sourceFiles.map(({ content }) => content)
  for (const depName of config.registryDependencies ?? []) {
    const depDirs = allDirs.get(stripRegistryScope(depName))
    if (!depDirs) continue
    const depDirName = depDirs[base] ?? depDirs.shared
    if (!depDirName) continue
    const depPath = resolve(REGISTRY_COMPONENTS, depDirName)
    for (const { content: raw } of readComponentFiles(depPath)) {
      initialLibScan.push(raw)
    }
  }
  for (const f of config.files ?? []) {
    if (f.type !== "registry:lib") continue
    const abs = resolveConfigRegistryLibFile(f.path)
    if (!abs) {
      throw new Error(`files entry not found under registry/lib: ${f.path}`)
    }
    initialLibScan.push(readFileSync(abs, "utf-8"))
  }

  const libMap = collectRegistryLibRecursive(initialLibScan)
  for (const f of config.files ?? []) {
    if (f.type !== "registry:lib") continue
    const abs = resolveConfigRegistryLibFile(f.path)
    if (!abs) continue
    const rel = relative(REGISTRY_LIB, abs).replace(/\\/g, "/")
    libMap.set(rel, readFileSync(abs, "utf-8"))
  }
  const files: RegistryItem["files"] = []

  const libEntries = [...libMap.entries()].sort(([a], [b]) => a.localeCompare(b))
  for (const [rel, raw] of libEntries) {
    let content = await transformStyle(raw, { styleMap })
    content = rewriteRegistryImports(content, "consumer")
    content = rewriteRegistryLibImports(content, "consumer")
    files.push({
      path: `lib/${rel}`,
      content,
      type: "registry:lib",
    })
  }

  for (const { filename, content: raw } of sourceFiles) {
    let content = await transformStyle(raw, { styleMap })
    content = rewriteRegistryImports(content, "consumer")
    content = rewriteRegistryLibImports(content, "consumer")
    files.push({
      path: `components/ui/${filename}`,
      content,
      type: "registry:ui",
    })
  }

  for (const depName of config.registryDependencies ?? []) {
    const depDirs = allDirs.get(stripRegistryScope(depName))
    if (!depDirs) continue
    const depDirName = depDirs[base] ?? depDirs.shared
    if (!depDirName) continue
    const depPath = resolve(REGISTRY_COMPONENTS, depDirName)
    for (const { filename, content: raw } of readComponentFiles(depPath)) {
      if (files.some((f) => f.path === `components/ui/${filename}`)) continue
      let content = await transformStyle(raw, { styleMap })
      content = rewriteRegistryImports(content, "consumer")
      content = rewriteRegistryLibImports(content, "consumer")
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

async function copyUIToExamples(allDirs: Map<string, ComponentDirs>, configs: ItemConfig[]) {
  const styleCss = readFileSync(resolve(REGISTRY_STYLES, `style-${DEFAULT_STYLE}.css`), "utf-8")
  const styleMap = createStyleMap(styleCss)
  const registryNames = new Set(allDirs.keys())

  for (const base of BASES) {
    const targetDir = resolve(EXAMPLES_DIR, base, "ui")
    const libDir = resolve(EXAMPLES_DIR, base, "lib")
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }
    mkdirSync(libDir, { recursive: true })

    const initialLibScan: string[] = []
    for (const [, dirs] of allDirs) {
      const dirName = dirs[base] ?? dirs.shared
      if (!dirName) continue
      const srcDir = resolve(REGISTRY_COMPONENTS, dirName)
      for (const f of readdirSync(srcDir).filter((n) => n.endsWith(".tsx") || n.endsWith(".ts"))) {
        initialLibScan.push(readFileSync(resolve(srcDir, f), "utf-8"))
      }
    }
    for (const c of configs) {
      for (const f of c.files ?? []) {
        if (f.type !== "registry:lib") continue
        const abs = resolveConfigRegistryLibFile(f.path)
        if (abs) initialLibScan.push(readFileSync(abs, "utf-8"))
      }
    }

    const libMap = collectRegistryLibRecursive(initialLibScan)
    for (const c of configs) {
      for (const f of c.files ?? []) {
        if (f.type !== "registry:lib") continue
        const abs = resolveConfigRegistryLibFile(f.path)
        if (!abs) continue
        const rel = relative(REGISTRY_LIB, abs).replace(/\\/g, "/")
        libMap.set(rel, readFileSync(abs, "utf-8"))
      }
    }
    for (const [rel, raw] of [...libMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      let content = await transformStyle(raw, { styleMap })
      content = rewriteRegistryLibImports(content, "example")
      const outLib = resolve(libDir, rel)
      mkdirSync(dirname(outLib), { recursive: true })
      writeFileSync(outLib, content)
    }

    for (const [, dirs] of allDirs) {
      const dirName = dirs[base] ?? dirs.shared
      if (!dirName) continue

      const srcDir = resolve(REGISTRY_COMPONENTS, dirName)
      for (const f of readdirSync(srcDir).filter((n) => n.endsWith(".tsx") || n.endsWith(".ts"))) {
        const source = readFileSync(resolve(srcDir, f), "utf-8")
        let content = await transformStyle(source, { styleMap })
        content = rewriteRegistryImports(content, "example")
        content = rewriteRegistryLibImports(content, "example")
        content = rewriteComponentsUiForExamples(content, registryNames)
        writeFileSync(resolve(targetDir, f), content)
      }
    }

    console.log(
      `  ${chalk.green("➜")}  ${chalk.bold("Copied:")}   ${chalk.cyan(`${base}/ui/`)} ${chalk.cyan(`${base}/lib/`)}`,
    )
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const configs = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as ItemConfig[]
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
      const deps = config.registryDependencies ?? []

      if (itemType === "registry:style") {
        const styleItem = {
          ...config,
          description: getDescription(config, base),
          dependencies: getDependencies(config, base),
          registryDependencies: deps,
        }
        writeFileSync(resolve(outDir, `${config.name}.json`), JSON.stringify(styleItem, null, 2))
        console.log(
          `  ${chalk.green("➜")}  ${chalk.bold("Built:")}   ${chalk.cyan(`${style}/${config.name}.json`)}`,
        )
        continue
      }

      const dirs = allDirs.get(config.name)
      if (!dirs && (config.categories ?? []).includes("meta")) {
        if (deps.length === 0) {
          throw new Error(`Meta item "${config.name}" must define registryDependencies`)
        }
        const metaItem = {
          ...config,
          description: getDescription(config, base),
          dependencies: getDependencies(config, base),
          registryDependencies: deps,
        }
        writeFileSync(resolve(outDir, `${config.name}.json`), JSON.stringify(metaItem, null, 2))
        console.log(
          `  ${chalk.green("➜")}  ${chalk.bold("Built:")}   ${chalk.cyan(`${style}/${config.name}.json`)} (meta)`,
        )
        continue
      }

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
      type: c.type ?? "registry:ui",
      title: c.title,
      description: getIndexDescription(c),
      categories: c.categories ?? [],
    })),
  }

  writeFileSync(resolve(OUTPUT, "registry.json"), JSON.stringify(registryIndex, null, 2))
  console.log(`  ${chalk.green("➜")}  ${chalk.bold("Built:")}   ${chalk.cyan("registry.json")}`)

  await copyUIToExamples(allDirs, configs)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
