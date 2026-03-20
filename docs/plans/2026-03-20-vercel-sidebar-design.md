# Vercel Sidebar (registry layer) — Design

**Date:** 2026-03-20  
**Status:** Approved

## Overview

Add a **`vercel-sidebar`** registry item in category **`layers`**, depending on the existing **`sidebar`** registry component. It keeps the same exported primitives as `sidebar` where possible, and adds a small API for **stacked navigation**: the scrollable middle region swaps between a **root rail** and **sub-panels** (e.g. Observability). **Header and footer stay fixed**; only the middle content changes. Root items with children **do not** inline-expand; they **replace** the middle with sub-links and a **back + title** row.

## UX reference

- **Root:** main links, chevron hints for drill-down, separators between sections.
- **Subgroup:** persistent header/footer; top of middle = back control + section title; items grouped with uppercase labels (`SidebarGroupLabel`).

## Architecture

- **State:** React context holding **active panel id** (string). **Default:** single level of drill-down — `root` vs one subgroup at a time (`defaultPanel` / optional controlled `panel` + `onPanelChange`). If product needs deeper stacks later, extend with a `panelStack: string[]` without breaking the default API.
- **SSR / no flicker:** The server passes **`defaultPanel`** (or controlled **`panel`**) derived from the route so the first HTML already renders the correct panel. No `useEffect` to “correct” after mount. Client navigations use **controlled** mode when the URL changes without full reload.
- **CSS:** Use CSS for **visibility / layout / optional motion** between panels (e.g. only one panel non-`hidden`, transitions). Interaction still updates state in JS.
- **Registry layout:** `layers-vercel-sidebar-base/` and `layers-vercel-sidebar-radix/`, mirroring `layers-confirmation-*`. Imports target the matching `overrides-sidebar-{base,radix}/sidebar` (and related local files). **`registryDependencies`:** `["sidebar"]`.

## Public API (target)

- **Re-exports:** All stable exports from the sibling `sidebar` module for the same variant (so consumers can import one package surface).
- **Additions (names indicative):**
  - **`VercelSidebarNav`** — client wrapper for the middle column: provider for panel id, scroll region.
  - **`VercelSidebarPanel`** — `panelId: string`, children; one panel is active at a time.
  - **`VercelSidebarBack`** — back button + title slot/prop for subgroup header.
  - **Trigger pattern:** extend or wrap **`SidebarMenuButton`** / composition so a root row can `onClick` → `setPanel("observability")` or use **`asChild`** + `Link` when navigation is route-driven.

## Accessibility

- Inactive panels: **`hidden`** and/or **`inert`** so focus does not leak into off-screen content.
- Back control: explicit **accessible name** (e.g. “Back” + context or `aria-label`).

## Non-goals (YAGNI)

- URL parsing inside the component (app passes panel from route).
- Radio-button-only panel switching.
- Nested drill-down beyond one level in v1 unless product confirms (see implementation plan extension note).

## Related

- Implementation plan: `docs/plans/2026-03-20-vercel-sidebar.md`
