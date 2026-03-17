import defaultMdxComponents from "fumadocs-ui/mdx"

import { ButtonAsLink } from "@/components/docs/button-as-link"
import { ButtonRadix } from "@/components/docs/button-radix"
import { ComponentPreview } from "@/components/docs/component-preview"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon } from "lucide-react"
import type { MDXComponents } from "mdx/types"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    Button,
    ButtonAsLink,
    ButtonRadix,
    ArrowUpIcon,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
