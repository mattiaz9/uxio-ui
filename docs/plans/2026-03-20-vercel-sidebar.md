# Vercel Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish `@uxio/vercel-sidebar` as a `layers` registry item that re-exports `sidebar` primitives and adds stacked root/sub navigation with SSR-safe initial panel.

**Architecture:** Two variant folders (`layers-vercel-sidebar-base`, `layers-vercel-sidebar-radix`) import from `overrides-sidebar-{base,radix}`. A client-only context tracks `activePanel` with `defaultPanel` / controlled `panel`. Sub-panels are siblings with CSS-friendly show/hide; header/footer remain standard `SidebarHeader` / `SidebarFooter` outside the stack.

**Tech Stack:** React, TypeScript, Tailwind, existing uxio registry build (`scripts/build-registry.ts`), shadcn registry item shape.

**Design doc:** `docs/plans/2026-03-20-vercel-sidebar-design.md`

---

## Task 0: Confirm `sidebar` is a registry item

**Files:**
- Modify: `registry/uxio/registry.config.json` (only if `sidebar` entry is missing)
- Reference: `registry/uxio/overrides-sidebar-base/sidebar.tsx`, `registry/uxio/overrides-sidebar-radix/sidebar.tsx`

**Step 1:** Search `registry.config.json` for `"name": "sidebar"`.

**Step 2:** If missing, add a `registry:ui` entry for `sidebar` with `categories: ["overrides"]`, correct `dependencies` for base/radix (match other overlay-heavy components: sheet, tooltip, button, input, skeleton, separator, etc. — mirror imports from `sidebar.tsx`), and `files` implied by build (no manual `files` in JSON; dirs must exist).

**Step 3:** Run: `pnpm exec tsx scripts/build-registry.ts`  
**Expected:** Build succeeds; `public/r/**/vercel-sidebar*.json` may not exist until Task 2–3.

**Step 4:** Commit (if you changed config only here):  
`git add registry/uxio/registry.config.json && git commit -m "chore(registry): register sidebar item"`

---

## Task 1: Scaffold `layers-vercel-sidebar-base`

**Files:**
- Create: `registry/uxio/layers-vercel-sidebar-base/vercel-sidebar.tsx`

**Step 1:** Add `"use client"` at top.

**Step 2:** Implement:
- `VercelSidebarNavContext` with `{ activePanel: string; setActivePanel: (id: string) => void }`.
- `VercelSidebarNav` props:
  - `defaultPanel?: string` (default `"root"`)
  - `panel?: string` + `onPanelChange?: (id: string) => void` for controlled mode
  - `children`, `className`, extend `ComponentProps` of the scroll wrapper you use (likely `SidebarContent` or a `div`).
- Initialize state: `useState(controlled ?? defaultPanel)` pattern — if `panel` is defined, derive from prop; else internal state seeded from `defaultPanel`.
- `VercelSidebarPanel` props: `panelId: string`, `children`, `className`. Render children only when `panelId === activePanel`; apply `hidden` when inactive and `inert` (or `aria-hidden` + tabIndex strategy) on inactive wrapper per a11y choice documented in code.

**Step 3:** `VercelSidebarBack` props: `title: ReactNode`, `className`, `onBack?: () => void` defaulting to `setActivePanel("root")` from context (or pop stack if you extended).

**Step 4:** At bottom of `vercel-sidebar.tsx`, re-export all public symbols from `@/registry/uxio/overrides-sidebar-base/sidebar` (`export * from "…"`) after defining `VercelSidebarNav`, `VercelSidebarPanel`, `VercelSidebarBack`, and optional `useVercelSidebarNav`. Split into a second file only if the module exceeds ~300 lines.

**Step 5:** Run: `pnpm exec tsc --noEmit`  
**Expected:** No errors.

**Step 6:** Commit:  
`git add registry/uxio/layers-vercel-sidebar-base/vercel-sidebar.tsx && git commit -m "feat(registry): add vercel-sidebar base layer"`

---

## Task 2: Mirror `layers-vercel-sidebar-radix`

**Files:**
- Create: `registry/uxio/layers-vercel-sidebar-radix/vercel-sidebar.tsx`

**Step 1:** Copy structure from base; replace imports:
- `@/registry/uxio/overrides-sidebar-radix/sidebar` for re-exports and any typed `ComponentProps`.

**Step 2:** `pnpm exec tsc --noEmit`

**Step 3:** Commit:  
`git add registry/uxio/layers-vercel-sidebar-radix/vercel-sidebar.tsx && git commit -m "feat(registry): add vercel-sidebar radix layer"`

---

## Task 3: Register `vercel-sidebar` in `registry.config.json`

**Files:**
- Modify: `registry/uxio/registry.config.json`

**Step 1:** Insert object (after `confirmation` or next to other `layers`):
```json
{
  "name": "vercel-sidebar",
  "type": "registry:ui",
  "title": "Vercel Sidebar",
  "description": "Sidebar with drill-down panels: root nav swaps to sub-links with back + title; header/footer fixed. SSR-safe via defaultPanel / controlled panel.",
  "categories": ["layers"],
  "dependencies": {
    "base": ["clsx", "tailwind-merge"],
    "radix": ["clsx", "tailwind-merge"]
  },
  "registryDependencies": ["sidebar"]
}
```
Tune `dependencies` if the implementation adds `lucide-react` for back icon.

**Step 2:** Run: `pnpm exec tsx scripts/build-registry.ts`  
**Expected:** New JSON under `public/r/` for each style including `vercel-sidebar`.

**Step 3:** Commit:  
`git add registry/uxio/registry.config.json && git commit -m "chore(registry): register vercel-sidebar"`

---

## Task 4: Example usage (optional but recommended)

**Files:**
- Create or modify under `src/examples/` per repo convention for registry demos
- Ensure imports use paths that `build-registry` rewrites for examples (`@/registry/uxio/...`)

**Step 1:** Minimal example: `SidebarProvider` → `Sidebar` → `SidebarHeader` (placeholder) → `VercelSidebarNav` with `defaultPanel="root"` → two `VercelSidebarPanel`s → `SidebarFooter`.

**Step 2:** Document in example comment: server passes `defaultPanel={segment}` for no flicker.

**Step 3:** Run: `pnpm exec tsc --noEmit`

**Step 4:** Commit:  
`git add src/examples/... && git commit -m "docs(examples): vercel-sidebar usage"`

---

## Task 5: Verification

**Step 1:** `pnpm exec tsc --noEmit` — pass.

**Step 2:** `pnpm lint` (or project equivalent) — pass.

**Step 3:** Manually inspect `public/r/<style>/vercel-sidebar.json` for merged `sidebar` dependency and correct file paths.

**Step 4:** Final commit if any fixes.

---

## Extension note (multi-level)

If product later needs **parent stack**: replace `string` panel with `string[]`, back pops last element, `defaultPanel` becomes `defaultStack`. Keep `panelId` on `VercelSidebarPanel` unique per leaf; intermediate panels become push targets. Not required for v1.
