import { spawn } from "child_process"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

/**
 * Vite plugin that watches the registry folder
 * and runs the registry build script when changes are detected.
 *
 * This keeps the registry JSON and example components in sync during development.
 */
import type { Plugin } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..", "..")
const REGISTRY_DIR = resolve(ROOT, "registry")
const BUILD_SCRIPT = resolve(ROOT, "scripts/build-registry.ts")

function runBuild(changedPaths?: string[]): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const args = ["exec", "tsx", BUILD_SCRIPT]
    if (changedPaths && changedPaths.length > 0) {
      for (const p of changedPaths) {
        args.push("--changed", p)
      }
    }

    const child = spawn("pnpm", args, {
      cwd: ROOT,
      stdio: "inherit",
    })

    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise()
      } else {
        reject(new Error(`Registry build exited with code ${code}`))
      }
    })

    child.on("error", reject)
  })
}

export function autoGenRegistry(): Plugin {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const DEBOUNCE_MS = 150
  /** Paths coalesced within the debounce window; passed to the registry script for granular rebuilds. */
  const pendingChanged = new Set<string>()

  const scheduleBuild = (changedPath?: string) => {
    if (changedPath) pendingChanged.add(changedPath)
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      debounceTimer = null
      const paths = [...pendingChanged]
      pendingChanged.clear()
      try {
        await runBuild(paths.length > 0 ? paths : undefined)
      } catch (err) {
        console.error("[auto-gen-registry]", err)
      }
    }, DEBOUNCE_MS)
  }

  return {
    name: "auto-gen-registry",
    enforce: "pre",
    /** Only register for `vite` dev server, not `vite build` or preview. */
    apply: "serve",

    async buildStart() {
      await runBuild()
    },

    configureServer(server) {
      server.watcher.add(REGISTRY_DIR)

      server.watcher.on("change", (path) => {
        if (path.startsWith(REGISTRY_DIR)) {
          scheduleBuild(path)
        }
      })

      server.watcher.on("add", (path) => {
        if (path.startsWith(REGISTRY_DIR)) {
          scheduleBuild(path)
        }
      })

      server.watcher.on("unlink", (path) => {
        if (path.startsWith(REGISTRY_DIR)) {
          scheduleBuild(path)
        }
      })
    },
  }
}
