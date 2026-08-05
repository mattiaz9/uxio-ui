# Card asChild / render Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add composition to the root `Card` only — `asChild` (radix) and `render` (base) — and
document it with examples.

**Architecture:** Mirror Badge/Item: radix uses `Slot.Root` from `radix-ui`; base uses `useRender` +
`mergeProps` from `@base-ui/react`. Subcomponents stay plain `div`s. Docs gain one Extended Feature
section per base with a `ComponentPreview`.

**Tech Stack:** React, `radix-ui` Slot, `@base-ui/react` (`useRender`, `mergeProps`), CVA, MDX docs,
Vite examples under `src/examples/{base,radix}/`.

## Global Constraints

- Root `Card` only — do not add composition to header/title/description/action/content/footer.
- Radix API is `asChild`; base API is `render` (never `asChild` on base).
- Do not edit `components.json`, `src/components/ui/`, `src/styles/globals.css`, or any
  `registry/styles/style-*.css` theme files.
- Keep existing `size` / `variant` / `data-*` / CVA behavior when composition props are omitted.
- Docs copy stays brief (same tone as Destructive Variant).
- Registry deps must include the new packages (see Task 1 / Task 2).

## File Structure

| File                                          | Role                                    |
| --------------------------------------------- | --------------------------------------- |
| `registry/uxio/overrides-card-radix/card.tsx` | Radix Card with `asChild` + `Slot.Root` |
| `registry/uxio/overrides-card-base/card.tsx`  | Base Card with `render` + `useRender`   |
| `registry/uxio/registry.config.json`          | Card entry dependencies for both bases  |
| `src/examples/radix/card-as-child.tsx`        | Docs preview: link card via `asChild`   |
| `src/examples/base/card-render.tsx`           | Docs preview: link card via `render`    |
| `content/docs/overrides/radix/card.mdx`       | Document As Child                       |
| `content/docs/overrides/base/card.mdx`        | Document Render                         |

---

### Task 1: Radix Card `asChild`

**Files:**

- Modify: `registry/uxio/overrides-card-radix/card.tsx`
- Modify: `registry/uxio/registry.config.json` (card entry `dependencies.radix`)

**Interfaces:**

- Consumes: existing `cardVariants`, `size`, `variant`
- Produces: `Card` props include `asChild?: boolean` (default `false`); when true, element is
  `Slot.Root`

- [ ] **Step 1: Update radix Card implementation**

Replace the `Card` function (and add the Slot import). Leave all other exports unchanged.

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const cardVariants = cva("cn-card group/card flex flex-col", {
  variants: {
    variant: {
      default: "cn-card-variant-default",
      destructive: "cn-card-variant-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Card({
  className,
  size = "default",
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    size?: "default" | "sm"
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

// … CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter unchanged …
```

- [ ] **Step 2: Add radix registry dependency**

In `registry/uxio/registry.config.json`, find the `"name": "card"` entry and change
`dependencies.radix` from:

```json
"radix": ["class-variance-authority", "clsx", "tailwind-merge"]
```

to:

```json
"radix": ["radix-ui", "class-variance-authority", "clsx", "tailwind-merge"]
```

(Optionally update `description` to mention composition, e.g.
`"Card with destructive variant and asChild/render composition."` — keep it one sentence.)

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`

Expected: PASS (no errors in card files).

- [ ] **Step 4: Commit**

```bash
git add registry/uxio/overrides-card-radix/card.tsx registry/uxio/registry.config.json
git commit -m "$(cat <<'EOF'
feat(card): add asChild composition for radix Card

EOF
)"
```

---

### Task 2: Base Card `render`

**Files:**

- Modify: `registry/uxio/overrides-card-base/card.tsx`
- Modify: `registry/uxio/registry.config.json` (card entry `dependencies.base`)

**Interfaces:**

- Consumes: existing `cardVariants`, `size`, `variant`
- Produces: `Card` props extend `useRender.ComponentProps<"div">` with `render`; default tag `"div"`

- [ ] **Step 1: Update base Card implementation**

Replace imports and the `Card` function. Subcomponents stay unchanged. Match Badge/Item patterns:

```tsx
import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import type { ComponentPropsWithoutRef } from "react"

const cardVariants = cva("cn-card group/card flex flex-col", {
  variants: {
    variant: {
      default: "cn-card-variant-default",
      destructive: "cn-card-variant-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Card({
  className,
  size = "default",
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    size?: "default" | "sm"
  }) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(cardVariants({ variant }), className),
        "data-size": size,
        "data-variant": variant,
      } as ComponentPropsWithoutRef<"div">,
      props,
    ),
    render,
    state: {
      slot: "card",
      size,
      variant,
    },
  })
}

// … CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter unchanged …
```

- [ ] **Step 2: Add base registry dependencies**

In `registry/uxio/registry.config.json`, find the `"name": "card"` entry and change
`dependencies.base` from:

```json
"base": ["class-variance-authority", "clsx", "tailwind-merge"]
```

to:

```json
"base": [
  "@base-ui/react/merge-props",
  "@base-ui/react/use-render",
  "class-variance-authority",
  "clsx",
  "tailwind-merge"
]
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add registry/uxio/overrides-card-base/card.tsx registry/uxio/registry.config.json
git commit -m "$(cat <<'EOF'
feat(card): add render composition for base Card

EOF
)"
```

---

### Task 3: Examples and docs

**Files:**

- Create: `src/examples/radix/card-as-child.tsx`
- Create: `src/examples/base/card-render.tsx`
- Modify: `content/docs/overrides/radix/card.mdx`
- Modify: `content/docs/overrides/base/card.mdx`

**Interfaces:**

- Consumes: Task 1 `Card asChild`; Task 2 `Card render`
- Produces: preview names `radix/card-as-child` and `base/card-render` (auto-discovered by
  `src/lib/examples.ts`)

- [ ] **Step 1: Create radix example**

Create `src/examples/radix/card-as-child.tsx`:

```tsx
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"

export default function CardAsChild() {
  return (
    <Card asChild className="w-full max-w-sm">
      <a href="#">
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
          <CardDescription>Open the docs — this whole card is a link.</CardDescription>
        </CardHeader>
      </a>
    </Card>
  )
}
```

- [ ] **Step 2: Create base example**

Create `src/examples/base/card-render.tsx`:

```tsx
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"

export default function CardRender() {
  return (
    <Card render={<a href="#" />} className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Documentation</CardTitle>
        <CardDescription>Open the docs — this whole card is a link.</CardDescription>
      </CardHeader>
    </Card>
  )
}
```

- [ ] **Step 3: Update radix docs**

In `content/docs/overrides/radix/card.mdx`:

1. Add `- [As Child](#as-child)` under Extended Features.
2. Append this section after the Destructive Variant example (leave Install unchanged):

```mdx
### As Child

Use `asChild` to render the card as its child element — for example an anchor — while keeping card
styles and data attributes.

<ComponentPreview name="radix/card-as-child" />
```

- [ ] **Step 4: Update base docs**

In `content/docs/overrides/base/card.mdx`:

1. Add `- [Render](#render)` under Extended Features.
2. Append this section after the Destructive Variant example (leave Install unchanged):

```mdx
### Render

Use `render` to compose the card onto another element — for example an anchor — while keeping card
styles and data attributes.

<ComponentPreview name="base/card-render" />
```

- [ ] **Step 5: Sync examples UI + typecheck**

Run: `pnpm registry:build`

Expected: copies updated card into `src/examples/{base,radix}/ui/card.tsx`.

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add \
  src/examples/radix/card-as-child.tsx \
  src/examples/base/card-render.tsx \
  content/docs/overrides/radix/card.mdx \
  content/docs/overrides/base/card.mdx \
  src/examples/radix/ui/card.tsx \
  src/examples/base/ui/card.tsx
git commit -m "$(cat <<'EOF'
docs(card): document asChild and render composition

EOF
)"
```

(If `registry:build` also rewrites other generated files under `src/examples/**/ui/` or public
registry output, include only the card-related diffs in the commit unless the build always
regenerates a broader set that must ship together.)

---

## Spec coverage (self-review)

| Spec requirement                                    | Task                   |
| --------------------------------------------------- | ---------------------- |
| Radix `asChild` + `Slot.Root`                       | Task 1                 |
| Base `render` + `useRender` / `mergeProps`          | Task 2                 |
| Subcomponents unchanged                             | Tasks 1–2              |
| Registry dependency updates                         | Tasks 1–2              |
| Docs + examples per base                            | Task 3                 |
| No stylesheet / homepage / bundles changes          | — (explicit non-goals) |
| Default behavior preserved when composition omitted | Tasks 1–2              |
