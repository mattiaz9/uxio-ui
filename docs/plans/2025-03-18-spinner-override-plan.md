# Spinner Override Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a standalone `@uxio/spinner` registry override with a tick-based redesign, registry-scoped button imports, and bundled animation CSS.

**Architecture:** Create `registry/uxio/overrides-spinner/` with the tick spinner and animation CSS. Button overrides import from `@/registry/uxio/overrides-spinner/spinner`. Build script bundles spinner from registry and outputs animation CSS with the spinner item.

**Tech Stack:** React, Tailwind v4, shadcn registry format, TypeScript

**Design doc:** `docs/plans/2025-03-18-spinner-override-design.md`

---

## Task 1: Add @/registry path alias

**Files:**
- Modify: `tsconfig.json`

**Step 1: Add path alias**

Add to `compilerOptions.paths`:
```json
"@/registry/*": ["./registry/*"]
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add @/registry path alias"
```

---

## Task 2: Create spinner override component

**Files:**
- Create: `registry/uxio/overrides-spinner/spinner.tsx`

**Step 1: Create spinner.tsx**

```tsx
import React from "react"

import { cn } from "@/lib/utils"

interface SpinnerProps extends React.ComponentProps<"div"> {
  size?: number | string
  ticksCount?: number
  tickWidth?: string
}

export function Spinner({ className, ticksCount = 12, tickWidth = "8%" }: SpinnerProps) {
  return (
    <div className={cn("relative size-[1em]", className)}>
      {Array(ticksCount)
        .fill(0)
        .map((_, i) => {
          return (
            <div
              className={cn(
                "absolute right-1/2 h-1/2 origin-bottom scale-95 transform animate-tick-fade",
                "after:absolute after:inset-x-0 after:top-0 after:h-1/2 after:rounded-full after:bg-current",
              )}
              style={
                {
                  width: tickWidth,
                  transform: `rotate(${i * 30}deg)`,
                  animationDelay: `-${(ticksCount - i) * 0.1}s`,
                  opacity: `${0.1 + (0.9 / (ticksCount - 1)) * i}`,
                  "--tw-translate-x": parseInt(tickWidth) / 2,
                } as React.CSSProperties & { "--tw-translate-x": number }
              }
              key={i}
            />
          )
        })}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add registry/uxio/overrides-spinner/spinner.tsx
git commit -m "feat: add tick-based spinner override"
```

Note: Animation styles are shipped via registry `css` and `cssVars` (Task 4) — the shadcn CLI injects them into the user's globals. Do not add to `src/styles/app.css`; that is local-only.

---

## Task 3: Update button overrides to import from registry

**Files:**
- Modify: `registry/uxio/overrides-button-base/button.tsx`
- Modify: `registry/uxio/overrides-button-radix/button.tsx`

**Step 1: Update button-base import**

Change:
```tsx
import { Spinner } from "@/components/ui/spinner"
```
To:
```tsx
import { Spinner } from "@/registry/uxio/overrides-spinner/spinner"
```

**Step 2: Update button-radix import**

Same change as button-base.

**Step 3: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: No errors (with @/registry alias from Task 1)

**Step 4: Commit**

```bash
git add registry/uxio/overrides-button-base/button.tsx registry/uxio/overrides-button-radix/button.tsx
git commit -m "refactor(button): import spinner from registry"
```

---

## Task 4: Update build script for spinner source and import rewrite

**Files:**
- Modify: `scripts/build-registry.ts`

**Step 1: Add spinner registry path constant**

```ts
const SPINNER_REGISTRY_PATH = resolve(ROOT, "registry/uxio/overrides-spinner/spinner.tsx");
```

**Step 2: Update buildButtonItem**

- Change `SPINNER_PATH` usage to `SPINNER_REGISTRY_PATH` when reading spinner content
- After reading button source, rewrite `@/registry/uxio/overrides-spinner/spinner` → `@/components/ui/spinner` in content (for published registry output)
- In files array, keep spinner at `components/ui/spinner.tsx`
- **Add `css` and `cssVars`** to the button item — the button bundles the tick spinner, so users who add only `@uxio/button` must get the animation injected into their globals:

```ts
cssVars: {
  theme: { "animate-tick-fade": "tick-fade 1.2s infinite" },
},
css: {
  "@keyframes tick-fade": {
    "0%": { opacity: "1" },
    "100%": { opacity: "0.1" },
  },
},
```

**Step 3: Update copyUIToExamples**

- Read spinner from `SPINNER_REGISTRY_PATH` instead of `SPINNER_PATH`
- Rewrite button import from `@/registry/uxio/overrides-spinner/spinner` to `./spinner`

**Step 4: Add buildSpinnerItem function**

Use shadcn registry `css` and `cssVars` so the CLI injects the animation into the user's globals.css ([see](https://ui.shadcn.com/docs/registry/registry-item-json)):

```ts
async function buildSpinnerItem(): Promise<RegistryItem> {
  const spinnerContent = readFileSync(SPINNER_REGISTRY_PATH, "utf-8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "spinner",
    type: "registry:ui",
    title: "Spinner",
    description: "Tick-based spinner. A redesign of the original shadcn spinner.",
    dependencies: [],
    registryDependencies: [],
    files: [
      { path: "components/ui/spinner.tsx", content: spinnerContent, type: "registry:ui" },
    ],
    cssVars: {
      theme: {
        "animate-tick-fade": "tick-fade 1.2s infinite",
      },
    },
    css: {
      "@keyframes tick-fade": {
        "0%": { opacity: "1" },
        "100%": { opacity: "0.1" },
      },
    },
    categories: ["overrides"],
  };
}
```

**Step 5: Call buildSpinnerItem in main()**

For each style, also build and write `spinner.json`.

**Step 6: Update registry index**

Add spinner to `registryIndex.items`.

**Step 7: Extend RegistryItem interface**

Add `css` and `cssVars` to the interface if not present (see [registry-item schema](https://ui.shadcn.com/schema/registry-item.json)).

**Step 8: Verify**

Run: `pnpm run registry:build`
Expected: Build succeeds, `public/r/styles/base-nova/spinner.json` exists with `css` and `cssVars`, button.json contains `@/components/ui/spinner` in output

**Step 8: Commit**

```bash
git add scripts/build-registry.ts
git commit -m "feat(registry): build spinner item with animation CSS"
```

---

## Task 5: Update auto-gen plugin to watch spinner registry

**Files:**
- Modify: `plugins/auto-gen/index.ts`

**Step 1: Add spinner registry to watch**

Update watcher to include `registry/uxio/overrides-spinner/` (or ensure `REGISTRY_DIR` already covers it — `registry` folder is watched, so `registry/uxio/overrides-spinner` should be included).

Verify: Change spinner.tsx, build should re-run.

**Step 2: Commit**

```bash
git add plugins/auto-gen/index.ts
git commit -m "chore: ensure spinner registry is watched"
```

---

## Task 6: Add spinner documentation

**Files:**
- Create: `content/docs/overrides/base/spinner.mdx` (or shared `content/docs/overrides/spinner.mdx`)

**Step 1: Create spinner.mdx**

```mdx
---
title: Spinner
description: Tick-based spinner override — a redesign of the original shadcn spinner
---

The Spinner override replaces the default Loader2 spinner with a tick-based design.

## Install

\`\`\`bash
npx shadcn@latest add @uxio/spinner
\`\`\`

The animation CSS is automatically injected into your project's globals file when you add the component (via shadcn registry \`css\` and \`cssVars\`).

## Props

- \`size\` — Size of the spinner (default: 1em)
- \`ticksCount\` — Number of ticks (default: 12)
- \`tickWidth\` — Width of each tick (default: "8%")
- \`className\` — Additional classes

## Usage

\`\`\`tsx
<Spinner />
<Spinner className="size-8" ticksCount={8} />
\`\`\`
```

**Step 2: Add to docs navigation**

Check `source.config.ts` or Fumadocs config for sidebar/nav. Add spinner link under overrides.

**Step 3: Commit**

```bash
git add content/docs/overrides/base/spinner.mdx
git commit -m "docs: add spinner override documentation"
```

---

## Verification Checklist

- [ ] `pnpm run registry:build` succeeds
- [ ] `public/r/styles/base-nova/spinner.json` exists with spinner.tsx, `css`, and `cssVars`
- [ ] `public/r/styles/base-nova/button.json` includes `css` and `cssVars` for tick-fade (button bundles spinner)
- [ ] In a test project: `npx shadcn add @uxio/button` — verify globals.css receives `@keyframes tick-fade` and theme var
- [ ] `pnpm exec tsc --noEmit` passes
