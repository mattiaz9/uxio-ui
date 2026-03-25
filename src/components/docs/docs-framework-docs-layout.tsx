"use client"

import { useMemo, type ComponentProps } from "react"
import { getRouteApi } from "@tanstack/react-router"
import { DocsLayout } from "fumadocs-ui/layouts/docs"

import { useDocsSidebarFramework } from "@/lib/docs-framework-client"
import { buildDocsPathFromSplat, mapDocsPageTreeFramework } from "@/lib/docs-page-tree"

const docsRouteApi = getRouteApi("/docs/$")

type DocsLayoutProps = ComponentProps<typeof DocsLayout>

export function DocsFrameworkDocsLayout({
  tree,
  children,
  ...props
}: Omit<DocsLayoutProps, "tree"> & {
  tree: NonNullable<DocsLayoutProps["tree"]>
}) {
  const params = docsRouteApi.useParams()
  const docsPath = buildDocsPathFromSplat(params._splat)
  const framework = useDocsSidebarFramework(docsPath)
  const mappedTree = useMemo(() => mapDocsPageTreeFramework(tree, framework), [tree, framework])

  return (
    <DocsLayout {...props} tree={mappedTree}>
      {children}
    </DocsLayout>
  )
}
