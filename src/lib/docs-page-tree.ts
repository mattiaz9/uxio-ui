import type { Root, Node } from "fumadocs-core/page-tree"

export type DocsFramework = "radix" | "base"

/** Real browser path for `/docs/$` splat routes (TanStack `location.pathname` is often `/docs/$`, not the resolved URL). */
export function buildDocsPathFromSplat(splat: string | undefined): string {
  const s = splat ?? ""
  if (s === "") return "/docs"
  return `/docs/${s}`
}

export function getDocsFrameworkFromPath(pathname: string): DocsFramework | null {
  const match = /^\/docs\/(?:overrides|inputs|layout|layers)\/(radix|base)(?:\/|$)/.exec(pathname)
  if (match && (match[1] === "radix" || match[1] === "base")) {
    return match[1]
  }
  return null
}

/** Normalize sidebar item URLs to the active framework (meta.json authors use Radix paths). */
function rewriteDocsFrameworkUrl(url: string, target: DocsFramework): string {
  let out = url
  for (const section of ["overrides", "inputs", "layout", "layers"] as const) {
    const radixPrefix = `/docs/${section}/radix/`
    const basePrefix = `/docs/${section}/base/`
    if (target === "base" && out.startsWith(radixPrefix)) {
      out = basePrefix + out.slice(radixPrefix.length)
    } else if (target === "radix" && out.startsWith(basePrefix)) {
      out = radixPrefix + out.slice(basePrefix.length)
    }
  }
  return out
}

function mapPageTreeNode(node: Node, target: DocsFramework): Node {
  if (node.type === "separator") {
    return node
  }
  if (node.type === "page") {
    const nextUrl = rewriteDocsFrameworkUrl(node.url, target)
    return nextUrl === node.url ? node : { ...node, url: nextUrl }
  }
  return {
    ...node,
    index: node.index ? (mapPageTreeNode(node.index, target) as typeof node.index) : undefined,
    children: node.children.map((child) => mapPageTreeNode(child, target)),
  }
}

/**
 * Clone page tree so sidebar links target the chosen framework.
 *
 * Fumadocs `TreeContextProvider` memoizes with `useMemo(() => rawTree, [rawTree.$id ?? rawTree])`.
 * Serialized trees carry a stable root `$id`, so we must drop it or the sidebar never picks up URL /
 * framework changes until a full reload.
 */
export function mapDocsPageTreeFramework(root: Root, target: DocsFramework): Root {
  const { $id: _ignoredRootId, ...rootRest } = root
  return {
    ...rootRest,
    children: root.children.map((child) => mapPageTreeNode(child, target)),
    fallback: root.fallback ? mapDocsPageTreeFramework(root.fallback, target) : undefined,
  }
}
