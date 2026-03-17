"use client"

import { Link, useRouterState } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

const FRAMEWORKS = [
  { name: "radix", title: "Radix" },
  { name: "base", title: "Base UI" },
] as const

export function DocsFrameworkSwitcher({
  framework,
  component,
  className,
}: {
  framework: string
  component: string
  className?: string
}) {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  return (
    <div
      className={cn(
        "not-prose mb-4 inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
    >
      {FRAMEWORKS.map((fw) => {
        const href = `/docs/overrides/${fw.name}/${component}`
        const isActive = pathname === href || pathname.startsWith(href + "/")

        return (
          <Link
            key={fw.name}
            to={href}
            className={cn(
              "rounded-md px-3 py-1 text-sm transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground",
            )}
          >
            {fw.title}
          </Link>
        )
      })}
    </div>
  )
}
