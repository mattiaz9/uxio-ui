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
import { resolve, dirname, relative, sep } from "path"
import { fileURLToPath, pathToFileURL } from "url"
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

/** Same initial scan as `buildItem` for a given base (used for lib closure + granular rebuilds). */
function gatherInitialLibScanForBase(
  config: ItemConfig,
  dirs: ComponentDirs,
  allDirs: Map<string, ComponentDirs>,
  base: "base" | "radix",
): string[] {
  const dirName = dirs[base] ?? dirs.shared
  if (!dirName) return []

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
  return initialLibScan
}

/** Union of `registry/lib` rel paths merged into this item across base and radix variants. */
function collectLibRelKeysForItem(
  config: ItemConfig,
  dirs: ComponentDirs,
  allDirs: Map<string, ComponentDirs>,
): Set<string> {
  const keys = new Set<string>()
  for (const b of BASES) {
    const scan = gatherInitialLibScanForBase(config, dirs, allDirs, b)
    if (scan.length === 0) continue
    const libMap = collectRegistryLibRecursive(scan)
    for (const k of libMap.keys()) keys.add(k)
  }
  return keys
}

/** Items that declare `depName` in `registryDependencies` (bare or `@uxio/…`). */
function reverseRegistryDependents(configs: ItemConfig[], depName: string): Set<string> {
  const out = new Set<string>()
  for (const c of configs) {
    for (const d of c.registryDependencies ?? []) {
      if (stripRegistryScope(d) === depName) {
        out.add(c.name)
        break
      }
    }
  }
  return out
}

function logicalNameFromComponentFolderName(folderName: string): string | null {
  const withoutPrefix = folderName.replace(/^(overrides|layers|inputs)-/, "")
  if (withoutPrefix.endsWith("-base")) return withoutPrefix.replace(/-base$/, "")
  if (withoutPrefix.endsWith("-radix")) return withoutPrefix.replace(/-radix$/, "")
  return withoutPrefix
}

function parseCliArgs(argv: string[]): { changedPaths: string[] } {
  const changedPaths: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--changed" && argv[i + 1]) {
      changedPaths.push(argv[++i]!)
      continue
    }
    if (a.startsWith("--changed=")) {
      changedPaths.push(a.slice("--changed=".length))
    }
  }
  return { changedPaths }
}

/**
 * Map filesystem paths under `registry/` to registry item names that must be rebuilt.
 * Returns `"all"` when the change can affect every output (config, global styles).
 */
function getAffectedItemNames(
  changedPaths: string[],
  configs: ItemConfig[],
  allDirs: Map<string, ComponentDirs>,
): "all" | Set<string> {
  if (changedPaths.length === 0) return "all"

  const normalized = changedPaths.map((p) => resolve(p))
  const SHARED_ROOT = resolve(REGISTRY_COMPONENTS, "shared")

  for (const abs of normalized) {
    if (abs === CONFIG_PATH) return "all"
    if (abs.startsWith(REGISTRY_STYLES + sep) || abs === REGISTRY_STYLES) return "all"
  }

  const affected = new Set<string>()
  const libKeyCache = new Map<string, Set<string>>()

  const getLibKeysCached = (itemName: string): Set<string> => {
    const hit = libKeyCache.get(itemName)
    if (hit) return hit
    const config = configs.find((c) => c.name === itemName)
    const dirs = allDirs.get(itemName)
    if (!config || !dirs || (config.categories ?? []).includes("meta")) {
      libKeyCache.set(itemName, new Set())
      return libKeyCache.get(itemName)!
    }
    const itemType = config.type ?? "registry:ui"
    if (itemType !== "registry:ui") {
      libKeyCache.set(itemName, new Set())
      return libKeyCache.get(itemName)!
    }
    const keys = collectLibRelKeysForItem(config, dirs, allDirs)
    libKeyCache.set(itemName, keys)
    return keys
  }

  const addWithDependents = (logicalName: string) => {
    affected.add(logicalName)
    for (const n of reverseRegistryDependents(configs, logicalName)) {
      affected.add(n)
    }
  }

  for (const abs of normalized) {
    if (abs.startsWith(REGISTRY_LIB + sep) || abs === REGISTRY_LIB) {
      const libRel = relative(REGISTRY_LIB, abs).replace(/\\/g, "/")
      for (const c of configs) {
        if ((c.type ?? "registry:ui") !== "registry:ui") continue
        if ((c.categories ?? []).includes("meta")) continue
        if (!allDirs.has(c.name)) continue
        const dirs = allDirs.get(c.name)!
        if (!dirs.shared && !dirs.base && !dirs.radix) continue
        if (getLibKeysCached(c.name).has(libRel)) {
          addWithDependents(c.name)
        }
      }
      continue
    }

    if (abs.startsWith(SHARED_ROOT + sep) || abs === SHARED_ROOT) {
      const rel = relative(SHARED_ROOT, abs).replace(/\\/g, "/")
      const modStem = rel.replace(/\.(tsx|ts)$/, "")
      if (!modStem) return "all"
      const needles: string[] = []
      const parts = modStem.split("/")
      for (let i = 0; i < parts.length; i++) {
        needles.push(`@/registry/uxio/shared/${parts.slice(0, i + 1).join("/")}`)
      }

      for (const [, dirs] of allDirs) {
        for (const variant of BASES) {
          const dirName = dirs[variant] ?? dirs.shared
          if (!dirName) continue
          const srcDir = resolve(REGISTRY_COMPONENTS, dirName)
          if (!existsSync(srcDir)) continue
          for (const f of readdirSync(srcDir).filter((n) => n.endsWith(".tsx") || n.endsWith(".ts"))) {
            const content = readFileSync(resolve(srcDir, f), "utf-8")
            if (needles.some((n) => content.includes(n))) {
              const logical = logicalNameFromComponentFolderName(dirName)
              if (logical) addWithDependents(logical)
            }
          }
        }
      }
      continue
    }

    if (!abs.startsWith(REGISTRY_COMPONENTS + sep) && abs !== REGISTRY_COMPONENTS) {
      return "all"
    }

    const relToUxio = relative(REGISTRY_COMPONENTS, abs).replace(/\\/g, "/")
    const top = relToUxio.split("/")[0] ?? ""

    if (top === "shared") {
      continue
    }

    if (
      top.startsWith("overrides-") ||
      top.startsWith("layers-") ||
      top.startsWith("inputs-")
    ) {
      const logical = logicalNameFromComponentFolderName(top)
      if (logical) addWithDependents(logical)
      continue
    }

    return "all"
  }

  if (affected.size === 0) return "all"
  return affected
}

/** True when `name` is a top-level registry UI item in config (not meta / style). */
function isPublishableRegistryUiConfig(name: string, configs: ItemConfig[]): boolean {
  const config = configs.find((c) => c.name === name)
  if (!config) return false
  if ((config.type ?? "registry:ui") !== "registry:ui") return false
  if ((config.categories ?? []).includes("meta")) return false
  return true
}

/**
 * Folders like `overrides-calendar-*` map to `calendar` but there is no `calendar` config row;
 * those components are only published as part of dependents. Map them to items that list them in
 * `registryDependencies`.
 */
function expandBundledOnlyComponents(names: Set<string>, configs: ItemConfig[]): Set<string> {
  const out = new Set<string>()
  for (const name of names) {
    if (isPublishableRegistryUiConfig(name, configs)) {
      out.add(name)
      continue
    }
    for (const d of reverseRegistryDependents(configs, name)) {
      out.add(d)
    }
  }
  return out
}

/** Names that produce registry UI JSON + example copies (excludes meta, styles, missing dirs). */
function filterPublishableItemNames(
  names: Set<string>,
  configs: ItemConfig[],
  allDirs: Map<string, ComponentDirs>,
): Set<string> {
  const out = new Set<string>()
  for (const name of names) {
    const config = configs.find((c) => c.name === name)
    if (!config) continue
    const itemType = config.type ?? "registry:ui"
    if (itemType !== "registry:ui") continue
    if ((config.categories ?? []).includes("meta")) continue
    const dirs = allDirs.get(name)
    if (!dirs) continue
    if (!dirs.shared && !dirs.base && !dirs.radix) continue
    out.add(name)
  }
  return out
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

  const initialLibScan = gatherInitialLibScanForBase(config, dirs, allDirs, base)

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

async function copyUIToExamples(
  allDirs: Map<string, ComponentDirs>,
  configs: ItemConfig[],
  onlyNames: Set<string> | null,
) {
  const styleCss = readFileSync(resolve(REGISTRY_STYLES, `style-${DEFAULT_STYLE}.css`), "utf-8")
  const styleMap = createStyleMap(styleCss)
  const registryNames = new Set(allDirs.keys())
  const partial = onlyNames !== null

  for (const base of BASES) {
    const targetDir = resolve(EXAMPLES_DIR, base, "ui")
    const libDir = resolve(EXAMPLES_DIR, base, "lib")
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }
    mkdirSync(libDir, { recursive: true })

    const initialLibScan: string[] = []
    for (const [name, dirs] of allDirs) {
      if (partial && !onlyNames!.has(name)) continue
      const dirName = dirs[base] ?? dirs.shared
      if (!dirName) continue
      const srcDir = resolve(REGISTRY_COMPONENTS, dirName)
      for (const f of readdirSync(srcDir).filter((n) => n.endsWith(".tsx") || n.endsWith(".ts"))) {
        initialLibScan.push(readFileSync(resolve(srcDir, f), "utf-8"))
      }
    }
    for (const c of configs) {
      if (partial && !onlyNames!.has(c.name)) continue
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

    for (const [name, dirs] of allDirs) {
      if (partial && !onlyNames!.has(name)) continue
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

    const scope =
      partial && onlyNames!.size > 0
        ? `${onlyNames!.size} item(s)`
        : "all components"
    console.log(
      `  ${chalk.green("➜")}  ${chalk.bold("Copied:")}   ${chalk.cyan(`${base}/ui/`)} ${chalk.cyan(`${base}/lib/`)} ${chalk.dim(`(${scope})`)}`,
    )
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function runBuild(onlyNames: Set<string> | null) {
  const partial = onlyNames !== null
  const configs = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as ItemConfig[]
  const allDirs = scanComponents()

  if (partial && onlyNames!.size > 0) {
    console.log(
      `  ${chalk.blue("○")}  ${chalk.bold("Partial registry build:")} ${chalk.cyan([...onlyNames!].sort().join(", "))}`,
    )
  }

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
        if (partial) continue
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
        if (partial) continue
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
        if (!partial) {
          console.warn(`  ${chalk.yellow("⚠")}  No directory found for "${config.name}", skipping`)
        }
        continue
      }
      if (!dirs.shared && !dirs[base]) continue

      if (partial && onlyNames && !onlyNames.has(config.name)) continue

      const item = await buildItem(config, dirs, allDirs, style, styleMap)
      writeFileSync(resolve(outDir, `${config.name}.json`), JSON.stringify(item, null, 2))
      console.log(
        `  ${chalk.green("➜")}  ${chalk.bold("Built:")}   ${chalk.cyan(`${style}/${config.name}.json`)}`,
      )
    }
  }

  if (!partial) {
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
  }

  await copyUIToExamples(allDirs, configs, onlyNames)
}

async function main() {
  const { changedPaths } = parseCliArgs(process.argv.slice(2))
  const configs = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as ItemConfig[]
  const allDirs = scanComponents()

  let onlyNames: Set<string> | null = null
  if (changedPaths.length > 0) {
    const affected = getAffectedItemNames(changedPaths, configs, allDirs)
    if (affected === "all") {
      onlyNames = null
    } else {
      onlyNames = filterPublishableItemNames(
        expandBundledOnlyComponents(affected, configs),
        configs,
        allDirs,
      )
      if (onlyNames.size === 0) {
        console.log(
          `  ${chalk.dim("[registry] No component outputs affected by these paths; skipping rebuild.")}`,
        )
        return
      }
    }
  }

  await runBuild(onlyNames)
}

const isMain =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url

if (isMain) {
  main().catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
}
