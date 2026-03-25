/// <reference types="vite/client" />
import { dynamic } from "fumadocs-mdx/runtime/dynamic"

import * as Config from "../source.config"

import type { InternalTypeConfig } from "fumadocs-mdx/runtime/types"

// oxlint-disable-next-line no-unused-vars
const create = await dynamic<
  typeof Config,
  InternalTypeConfig & {
    DocData: {}
  }
>(
  Config,
  { configPath: "source.config.ts", environment: "vite", outDir: ".source" },
  { doc: { passthroughs: ["extractedReferences"] } },
)
