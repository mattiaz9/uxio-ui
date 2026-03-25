"use client"

import { useLayoutEffect, useMemo, useSyncExternalStore } from "react"

import { type DocsFramework, getDocsFrameworkFromPath } from "@/lib/docs-page-tree"

const STORAGE_KEY = "uxio-docs-framework"

function isDocsFramework(value: string | undefined | null): value is DocsFramework {
  return value === "radix" || value === "base"
}

export function readStoredDocsFramework(): DocsFramework {
  if (typeof window === "undefined") return "radix"
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (isDocsFramework(raw)) return raw
  } catch {
    /* ignore */
  }
  return "radix"
}

export function setDocsFramework(framework: DocsFramework) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, framework)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("uxio-docs-framework"))
}

function subscribeDocsFramework(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("uxio-docs-framework", onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener("uxio-docs-framework", onChange)
    window.removeEventListener("storage", onChange)
  }
}

/**
 * Framework for docs sidebar links: persisted choice, kept in sync with the current URL when it
 * includes a framework segment (`/docs/overrides/base/...`, etc.). Use `setDocsFramework` from
 * the page switcher so the sidebar updates immediately before navigation finishes.
 */
export function useDocsSidebarFramework(pathname: string): DocsFramework {
  const fromPath = useMemo(() => getDocsFrameworkFromPath(pathname), [pathname])
  const stored = useSyncExternalStore(
    subscribeDocsFramework,
    readStoredDocsFramework,
    (): DocsFramework => "radix",
  )

  useLayoutEffect(() => {
    if (fromPath && fromPath !== readStoredDocsFramework()) {
      setDocsFramework(fromPath)
    }
  }, [fromPath])

  // URL wins so `/docs/.../base/...` maps the sidebar immediately; `stored` covers /docs home + persistence.
  return fromPath ?? stored
}
