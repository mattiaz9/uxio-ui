# Spinner Override Design

**Date:** 2025-03-18  
**Status:** Approved

## Overview

Add a standalone `@uxio/spinner` registry override with a tick-based redesign of the original shadcn
spinner. The button will import the spinner from the registry framework folder
(`@/registry/uxio/overrides-spinner/spinner`), following the shadcn pattern of
`@/registry/bases/radix/*`.

## Architecture

- **`registry/uxio/overrides-spinner/`** — New tick-based spinner (redesign of the original Loader2
  spinner)
- **`registry/uxio/overrides-button-base/`** and **`registry/uxio/overrides-button-radix/`** —
  Import spinner from `@/registry/uxio/overrides-spinner/spinner`
- **`src/components/ui/spinner.tsx`** — Remains Loader2 for the app; registry build uses the
  registry spinner, not this file

## Spinner Component

**Location:** `registry/uxio/overrides-spinner/spinner.tsx`

**Props:**

- `size?: number | string`
- `ticksCount?: number` (default: 12)
- `tickWidth?: string` (default: "8%")
- `className`, plus standard `div` props

**Implementation:** Tick-based design using `animate-tick-fade` on each tick.

## Animation CSS (shadcn registry `css` + `cssVars`)

The shadcn registry supports adding CSS to the project's globals file via `css` and `cssVars`
([registry-item-json](https://ui.shadcn.com/docs/registry/registry-item-json)). The CLI merges these
into the project's `tailwindCssFile` (e.g. `globals.css`).

**`cssVars.theme`** — Animation utility for Tailwind v4 `@theme`:

```json
"cssVars": {
  "theme": {
    "animate-tick-fade": "tick-fade 1.2s infinite"
  }
}
```

**`css`** — Keyframes:

```json
"css": {
  "@keyframes tick-fade": {
    "0%": { "opacity": "1" },
    "100%": { "opacity": "0.1" }
  }
}
```

No separate CSS file; the shadcn CLI injects these into the user's `tailwindCssFile` (globals.css)
when they run `npx shadcn add @uxio/spinner`. The registry JSON output must include `css` and
`cssVars` — do not rely on local `app.css` or any project-specific files.

## Path Alias

Add to `tsconfig.json`:

```json
"@/registry/*": ["./registry/*"]
```

## Build Script Changes

1. **`buildButtonItem`**
   - Read spinner from `registry/uxio/overrides-spinner/spinner.tsx` (not `src`)
   - Rewrite button import: `@/registry/uxio/overrides-spinner/spinner` → `@/components/ui/spinner`
     in output for consumers
   - **Include `css` and `cssVars`** for the tick-fade animation — the button bundles the spinner,
     so users who add only `@uxio/button` must receive the animation styles

2. **`copyUIToExamples`**
   - Copy spinner from `registry/uxio/overrides-spinner/spinner.tsx`
   - Rewrite button import to `./spinner` for examples

3. **`buildSpinnerItem`** (new)
   - Build standalone spinner registry item per style
   - Include spinner.tsx in files array
   - Include `css` and `cssVars` for animation (injected into globals by CLI)

## Registry Index

- Add `spinner` to registry index
- Build `public/r/styles/{style}/spinner.json` for each style
- Spinner has no style-specific CSS; content is shared across styles

## Documentation

- Add `content/docs/overrides/base/spinner.mdx` (or shared `content/docs/overrides/spinner.mdx`)
- **Note:** This override is a redesign of the original shadcn spinner
- Document props: `size`, `ticksCount`, `tickWidth`
- Note that animation CSS is auto-injected into globals via registry `css`/`cssVars`

## Dependencies

- Spinner has no external deps beyond `@/lib/utils` (cn)
- No lucide-react (unlike original Loader2 spinner)
