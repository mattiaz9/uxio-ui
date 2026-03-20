import type { ReactNode } from "react"

/** One row in the sidebar command palette; pass `panelId` to jump with `VercelSidebarSearchPopover` inside `VercelSidebarNav`. */
export type VercelSidebarSearchItem = {
  id: string
  title: string
  subtitle?: string
  keywords?: string[]
  panelId?: string
  onSelect?: () => void
  icon?: ReactNode
}

function normalizeQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

function haystackForItem(item: VercelSidebarSearchItem): string {
  return [item.title, item.subtitle, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

/**
 * Case-insensitive match: every whitespace-separated token in `query` must appear
 * somewhere in the item’s title, subtitle, or keywords (same rules as the palette).
 */
export function filterVercelSidebarItems(
  items: readonly VercelSidebarSearchItem[],
  query: string,
): VercelSidebarSearchItem[] {
  const words = normalizeQuery(query)
  if (words.length === 0) return [...items]
  return items.filter((item) => {
    const hay = haystackForItem(item)
    return words.every((w) => hay.includes(w))
  })
}
