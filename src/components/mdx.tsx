import defaultMdxComponents from "fumadocs-ui/mdx"

import { ComponentPreview } from "@/components/docs/component-preview"
import { DocsAlerterBase, DocsAlerterRadix } from "@/components/docs/docs-alerter"
import { DocsConfirmerBase, DocsConfirmerRadix } from "@/components/docs/docs-confirmer"
import { Kbd } from "@/components/ui/kbd"

import type { MDXComponents } from "mdx/types"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    DocsAlerterBase,
    DocsAlerterRadix,
    DocsConfirmerBase,
    DocsConfirmerRadix,
    Kbd,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
