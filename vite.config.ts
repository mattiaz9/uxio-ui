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
