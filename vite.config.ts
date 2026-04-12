import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

import { autoGenRegistry } from "./plugins/auto-gen"
import * as MdxConfig from "./source.config"

export default defineConfig({
  server: {
    port: 3000,
  },
  // Rolldown can emit broken CJS→ESM interop for inlined tslib (`__toESM(...).default` is
  // undefined when `__esModule` is set). Externalize so Node loads `tslib` at runtime.
  ssr: {
    external: ["tslib"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    autoGenRegistry(),
    tailwindcss(),
    mdx(MdxConfig),
    tanstackStart({
      srcDirectory: "src",
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
      },
    }),
    viteReact(),
    nitro(),
  ],
})
