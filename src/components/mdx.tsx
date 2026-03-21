import defaultMdxComponents from "fumadocs-ui/mdx"

import { ComponentPreview } from "@/components/docs/component-preview"
import { DocsAlerterBase, DocsAlerterRadix } from "@/components/docs/docs-alerter"
import { DocsConfirmerBase, DocsConfirmerRadix } from "@/components/docs/docs-confirmer"

import type { MDXComponents } from "mdx/types"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    DocsAlerterBase,
    DocsAlerterRadix,
    DocsConfirmerBase,
    DocsConfirmerRadix,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
