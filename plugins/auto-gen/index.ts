import { spawn } from "child_process"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

/**
 * Vite plugin that watches the registry folder and src/components/ui/spinner.tsx,
 * and runs the registry build script when changes are detected.
 *
 * This keeps the registry JSON and example components in sync during development.
 */
import type { Plugin } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..", "..")
const REGISTRY_DIR = resolve(ROOT, "registry")
const BUILD_SCRIPT = resolve(ROOT, "scripts/build-registry.ts")

function runBuild(): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("pnpm", ["exec", "tsx", BUILD_SCRIPT], {
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

  const scheduleBuild = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      debounceTimer = null
      try {
        await runBuild()
      } catch (err) {
        console.error("[auto-gen-registry]", err)
      }
    }, DEBOUNCE_MS)
  }

  return {
    name: "auto-gen-registry",
    enforce: "pre",

    async buildStart() {
      await runBuild()
    },

    configureServer(server) {
      server.watcher.add(REGISTRY_DIR)

      server.watcher.on("change", (path) => {
        if (path.startsWith(REGISTRY_DIR)) {
          scheduleBuild()
        }
      })

      server.watcher.on("add", (path) => {
        if (path.startsWith(REGISTRY_DIR)) {
          scheduleBuild()
        }
      })

      server.watcher.on("unlink", (path) => {
        if (path.startsWith(REGISTRY_DIR)) {
          scheduleBuild()
        }
      })
    },
  }
}
