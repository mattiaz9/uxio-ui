/// <reference types="vite/client" />
import { browser } from "fumadocs-mdx/runtime/browser"

import type * as Config from "../source.config"
import type { InternalTypeConfig } from "fumadocs-mdx/runtime/types"

const create = browser<
  typeof Config,
  InternalTypeConfig & {
    DocData: {}
  }
>()
const browserCollections = {
  docs: create.doc(
    "docs",
    import.meta.glob(["./**/*.{mdx,md}"], {
      base: "./../content/docs",
      query: {
        collection: "docs",
      },
      eager: false,
    }),
  ),
}
export default browserCollections
