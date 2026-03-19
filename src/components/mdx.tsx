import defaultMdxComponents from "fumadocs-ui/mdx"

import { ComponentPreview } from "@/components/docs/component-preview"
import {
  DocsConfirmerBase,
  DocsConfirmerRadix,
} from "@/components/docs/docs-confirmation-confirmer"

import type { MDXComponents } from "mdx/types"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    DocsConfirmerBase,
    DocsConfirmerRadix,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
