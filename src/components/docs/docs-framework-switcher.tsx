"use client"

import { Link } from "@tanstack/react-router"

import { setDocsFramework } from "@/lib/docs-framework-client"
import { cn } from "@/lib/utils"

const FRAMEWORKS = [
  { name: "radix", title: "Radix" },
  { name: "base", title: "Base UI" },
] as const

export function DocsFrameworkSwitcher({
  section,
  framework,
  component,
  className,
}: {
  section?: string
  framework: string
  component: string
  className?: string
}) {
  const sectionPath = section ?? "overrides"

  return (
    <div
      className={cn(
        "not-prose mb-4 inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
    >
      {FRAMEWORKS.map((fw) => {
        const splat = `${sectionPath}/${fw.name}/${component}`
        const isActive = fw.name === framework

        return (
          <Link
            key={fw.name}
            to="/docs/$"
            params={{ _splat: splat }}
            onClick={() => setDocsFramework(fw.name)}
            className={cn(
              "rounded-md px-3 py-1 text-sm transition-colors",
              isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
            )}
          >
            {fw.title}
          </Link>
        )
      })}
    </div>
  )
}
