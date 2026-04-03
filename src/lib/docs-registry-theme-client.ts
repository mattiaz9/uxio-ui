"use client"

import { useLayoutEffect, useSyncExternalStore } from "react"

export const DOCS_REGISTRY_THEMES = ["lyra", "maia", "mira", "nova", "vega", "luma"] as const

export type DocsRegistryThemeId = (typeof DOCS_REGISTRY_THEMES)[number]

const STORAGE_KEY = "uxio-docs-registry-theme"

function isTheme(value: string | undefined | null): value is DocsRegistryThemeId {
  return (DOCS_REGISTRY_THEMES as readonly string[]).includes(value ?? "")
}

export const DEFAULT_DOCS_REGISTRY_THEME: DocsRegistryThemeId = "nova"

export function registryThemeRootClass(id: DocsRegistryThemeId): string {
  return `style-${id}`
}

export function readStoredDocsRegistryTheme(): DocsRegistryThemeId {
  if (typeof window === "undefined") return DEFAULT_DOCS_REGISTRY_THEME
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (isTheme(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_DOCS_REGISTRY_THEME
}

export function setDocsRegistryTheme(theme: DocsRegistryThemeId) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("uxio-docs-registry-theme"))
}

function subscribeDocsRegistryTheme(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("uxio-docs-registry-theme", onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener("uxio-docs-registry-theme", onChange)
    window.removeEventListener("storage", onChange)
  }
}

export function useDocsRegistryTheme(): DocsRegistryThemeId {
  return useSyncExternalStore(
    subscribeDocsRegistryTheme,
    readStoredDocsRegistryTheme,
    () => DEFAULT_DOCS_REGISTRY_THEME,
  )
}

/** Applies `style-{theme}` on `document.body` so docs previews and Radix portals see `cn-*` rules. */
export function DocsRegistryThemeBodyClassEffect() {
  const theme = useDocsRegistryTheme()

  useLayoutEffect(() => {
    const cls = registryThemeRootClass(theme)
    const all = DOCS_REGISTRY_THEMES.map((t) => registryThemeRootClass(t))
    for (const c of all) {
      document.body.classList.remove(c)
    }
    document.body.classList.add(cls)
    return () => {
      document.body.classList.remove(cls)
    }
  }, [theme])

  return null
}
