# Card composition (`asChild` / `render`) — Design

## Goal

Allow the root `Card` to morph onto a child element (e.g. an `<a>` or Next.js `Link`) so interactive cards avoid an extra wrapper `div`. Subcomponents stay as plain `div`s.

## Scope

| In scope | Out of scope |
| --- | --- |
| Root `Card` only | `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` |
| Radix: `asChild` + `Slot` | Shared composition helper abstraction |
| Base: `render` + `useRender` | Stylesheet / CVA changes |
| Docs + examples for both bases | Homepage / bundles updates (existing card already documented) |

## API

### Radix (`registry/uxio/overrides-card-radix/card.tsx`)

Mirror Badge/Item:

```tsx
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
```

Usage:

```tsx
<Card asChild>
  <a href="/docs">…</a>
</Card>
```

### Base (`registry/uxio/overrides-card-base/card.tsx`)

Mirror Badge/Item:

```tsx
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
      },
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
```

Usage:

```tsx
<Card render={<a href="/docs" />}>…</Card>
```

`data-slot`, `data-size`, `data-variant`, and existing CVA classes must continue to apply when composing.

## Docs

Update both:

- `content/docs/overrides/radix/card.mdx`
- `content/docs/overrides/base/card.mdx`

Add under Extended Features:

- Radix: **As Child** — short description + `<ComponentPreview name="radix/card-as-child" />`
- Base: **Render** — short description + `<ComponentPreview name="base/card-render" />`

Keep copy brief (same tone as Destructive Variant). Do not enumerate every internal change.

## Examples

| File | Content |
| --- | --- |
| `src/examples/radix/card-as-child.tsx` | `Card asChild` wrapping an `<a>` with standard header/content composition |
| `src/examples/base/card-render.tsx` | `Card render={<a … />}` with the same composition |

Examples should reuse the existing example import style (`./ui/card`, etc.) and stay visually simple (link card with title + description).

## Non-goals

- No new card variants or CSS in `registry/styles/style-*-uxio.css`
- No changes to `registry.config.json` dependencies unless `radix-ui` / `@base-ui/react` imports require it (they should already be present via other overrides; Card itself currently has no Slot dependency on radix — adding `import { Slot } from "radix-ui"` may need a registry dependency check)
- No homepage/bundles updates (card already listed)

## Acceptance

1. Radix `Card` accepts `asChild` and merges props/classes onto the child via `Slot.Root`.
2. Base `Card` accepts `render` and merges props/classes via `useRender` / `mergeProps`.
3. Subcomponents unchanged.
4. Docs list the feature and show a working preview for each base.
5. Destructive variant and existing card behavior remain unchanged when `asChild`/`render` are omitted.
