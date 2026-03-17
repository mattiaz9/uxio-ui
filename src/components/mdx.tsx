import defaultMdxComponents from "fumadocs-ui/mdx"

import { ComponentPreview } from "@/components/docs/component-preview"

import type { MDXComponents } from "mdx/types"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
