import * as React from "react"
import {
  HeadContent,
  Scripts,
  createRootRoute,
  defaultStringifySearch,
  useLocation,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Analytics } from "@vercel/analytics/react"
import { RootProvider } from "fumadocs-ui/provider/tanstack"

import { DefaultCatchBoundary } from "@/components/default-catch-boundary"
import { NotFound } from "@/components/not-found"
import appCss from "@/styles/globals.css?url"
import { seo } from "@/utils/seo"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "uxio/ui | Open-source UI library based on shadcn",
        description: `An open-source UI library based on shadcn/ui. Components for overrides, layout, and custom UI.`,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function VercelAnalytics() {
  const { pathname, search } = useLocation()
  const path = `${pathname}${defaultStringifySearch(search)}`
  return <Analytics path={path} route={pathname} />
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col">
        <RootProvider>{children}</RootProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
        <VercelAnalytics />
      </body>
    </html>
  )
}
