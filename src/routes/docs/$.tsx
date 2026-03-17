import { Suspense } from "react"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import browserCollections from "collections/browser"
import { useFumadocsLoader } from "fumadocs-core/source/client"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page"

import { DocsFrameworkSwitcher } from "@/components/docs/docs-framework-switcher"
import { useMDXComponents } from "@/components/mdx"
import { baseOptions } from "@/lib/layout.shared"
import { source } from "@/lib/source"

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? []
    const data = await serverLoader({ data: slugs })
    await clientLoader.preload(data.path)
    return data
  },
})

const serverLoader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs)
    if (!page) throw notFound()

    return {
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
    }
  })

const clientLoader = browserCollections.docs.createClientLoader({
  component(loaded) {
    // oxlint-disable-next-line eslint-plugin-react-hooks/rules-of-hooks
    const params = Route.useParams()
    const slugs = (params._splat ?? "").split("/").filter(Boolean)
    const showSwitcher = slugs[0] === "overrides" && slugs[1] && slugs[2]
    const { toc, frontmatter, default: MDX } = loaded

    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          {showSwitcher && (
            <DocsFrameworkSwitcher framework={slugs[1]} component={slugs[2]} className="mb-4" />
          )}
          {/* oxlint-disable-next-line eslint-plugin-react-hooks/rules-of-hooks */}
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    )
  },
})

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData())

  return (
    <div className="docs-content **:data-sidebar-placeholder:pt-16">
      <DocsLayout {...baseOptions()} tree={data.pageTree}>
        <Suspense>{clientLoader.useContent(data.path)}</Suspense>
      </DocsLayout>
    </div>
  )
}
