import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import mdx from 'fumadocs-mdx/vite'
import * as MdxConfig from './source.config'
import { autoGenRegistry } from './plugins/auto-gen'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    autoGenRegistry(),
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    mdx(MdxConfig),
    tanstackStart({
      srcDirectory: 'src',
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
