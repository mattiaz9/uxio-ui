---
title: Add size variant to custom inputs
---

## Goal

Expose the same `size` API as the **Input override** (`xs` | `sm` | `default` | `lg`) on every
**uxiō custom input** in the registry, with matching height, padding, and typography tokens
(`cn-input-size-*`), and aligned group chrome (input group + addons/steppers/icons).

**Source of truth for behavior and class names:** `registry/uxio/overrides-input-base/input.tsx` and
`registry/uxio/overrides-input-radix/input.tsx` (identical).

```6:20:registry/uxio/overrides-input-base/input.tsx
const inputVariants = cva(
  "cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        xs: "cn-input-size-xs",
        sm: "cn-input-size-sm",
        default: "cn-input-size-default",
        lg: "cn-input-size-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)
```

The override also sets `data-size={size}` on the native `<input>` for styling hooks.

**CSS tokens** (per theme in `registry/styles/style-*.css`): `.cn-input-size-xs` through
`.cn-input-size-lg` — heights align with Button (e.g. Lyra uses `h-6` / `h-7` / `h-8` / `h-9`).
Docs: `content/docs/overrides/base/input.mdx` and `content/docs/overrides/radix/input.mdx`.

---

## Scope — registry items (base + radix)

| Item             | Path pattern                                        | Mechanism today                                                                                    | Work needed                                                                                                                                                                |
| ---------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input-password` | `registry/uxio/inputs-input-password-{base,radix}/` | Uses `<Input />` from override + `cn-input-group-input`                                            | Pass `size` through (likely already via `...props`); align **InputGroupButton** (toggle) + **addon padding** with chosen size                                              |
| `input-number`   | `inputs-input-number-{base,radix}/`                 | `<Input />` + stepper **InputGroupButton**s                                                        | Pass `size` to `Input`; map size → `InputGroupButton` size; revisit stepper `className` heights if needed                                                                  |
| `input-currency` | `inputs-input-currency-{base,radix}/`               | `<Input />` + symbol addon                                                                         | Pass `size` to `Input`; optional addon spacing                                                                                                                             |
| `input-datetime` | `inputs-input-datetime-{base,radix}/`               | **No** `<Input />` for the visible control — bordered **`div`** with hardcoded `px-3 py-1 text-sm` | Add `size` prop; replace fixed padding/typography with **`cn-input-size-*`** on the segment container; calendar **InputGroupButton** + icon size; set `data-size` on group |
| `input-duration` | `inputs-input-duration-{base,radix}/`               | Segmented **`div`** only (no calendar addon)                                                       | Same segment + **InputGroup** sizing as datetime; no icon button                                                                                                           |
| `input-fraction` | `inputs-input-fraction-{base,radix}/`               | Segmented **`div`** only                                                                           | Same segment + **InputGroup** sizing; no icon button                                                                                                                       |

Implement **both** `*-base` and `*-radix` folders so published JSON stays in sync (same props and
structure; only import paths differ).

---

## Shared typing / API

- **Prop name:** `size`, same as `VariantProps<typeof inputVariants>["size"]` (i.e. `xs` | `sm` |
  `default` | `lg`).
- **Default:** `"default"` (match override).
- **Re-export:** Optionally re-export `inputVariants` from the override for `cn()` composition, or
  map manually to `cn-input-size-*` on non-`Input` surfaces.

Suggested shared type (inline per file or small shared helper under `registry/lib/` if you want one
import):

- `type InputSize = NonNullable<VariantProps<typeof inputVariants>["size"]>` Import `inputVariants`
  from `@/registry/uxio/overrides-input-{base,radix}/input`.

---

## Critical: `InputGroup` fixed height

`.cn-input-group` in theme CSS uses a **fixed** height (e.g. `h-8` in Lyra). The Input override’s
`lg` size is **`h-9`**. If you only set `size` on the inner `<Input />`, the **group border can clip
or mismatch** the inner control.

**Required follow-up when adding size to any component wrapped in `InputGroup`:**

1. Put **`data-size={size}`** on the root `<InputGroup />` (or a documented alternative).
2. Extend **each** `registry/styles/style-{lyra,vega,nova,mira,maia,luma}.css` so `.cn-input-group`
   height (and any related addon alignment) follows the size, e.g. match the same `h-*` as the
   corresponding `cn-input-size-*` for that theme.

Until the group is size-aware, verify **all four sizes** visually for password, number, currency,
and segmented inputs.

Reference group rule (Lyra):

```1336:1338:registry/styles/style-lyra.css
  .cn-input-group {
    @apply h-8 rounded-none border border-input transition-colors in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:bg-input/50 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-1 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col dark:bg-input/30 dark:has-disabled:bg-input/80 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5;
  }
```

---

## Segmented inputs (datetime, duration, fraction)

Today the interactive surface is roughly:

```242:246:registry/uxio/inputs-input-datetime-base/input-datetime.tsx
      <div
        className={cn(
          "cn-input-group-input flex h-full flex-1 flex-wrap items-center gap-0.5 px-3 py-1 text-sm",
          disabled && "pointer-events-none opacity-50",
        )}
```

**Do not** add the full `cn-input` class on this `div` (would duplicate borders; the group supplies
the outer border). **Do** apply the same **dimensional** tokens as the override:

- Keep `cn-input-group-input` and flex layout.
- Replace `px-3 py-1 text-sm` with the appropriate **`cn-input-size-{xs|sm|default|lg}`** class for
  the chosen `size` (same mapping as `inputVariants`).
- Keep `data-slot="input-datetime-control"` (or equivalent) for focus/invalid styles.
- Set **`data-size={size}`** on `InputGroup` and/or the segment container if CSS or tests need it.

**Calendar (datetime only):** `InputGroupButton` for the calendar uses `size="icon-sm"` today. Map
input size to group button sizes so icons stay centered (see `inputGroupButtonVariants` in
`registry/uxio/overrides-input-group-{base,radix}/input-group.tsx`: `xs`, `sm`, `icon-xs`,
`icon-sm`). Example mapping to validate visually:

| `size` (input) | Suggested `InputGroupButton` size            |
| -------------- | -------------------------------------------- |
| `xs`           | `icon-xs`                                    |
| `sm`           | `icon-sm` (or `xs` for text buttons)         |
| `default`      | `icon-sm`                                    |
| `lg`           | `icon-sm` or a larger variant if you add one |

**Icons:** `IconPlaceholder` uses `className="size-4"`; consider `size-3.5` for `xs` if it looks
tight.

---

## `Input`-based components (password, number, currency)

- **Extend props** with `size` from `ComponentProps<typeof Input>` (or explicit
  `VariantProps<typeof inputVariants>`) where not already present.
- Destructuring: ensure `size` is **not** dropped — pass `size={size ?? "default"}` into
  `<Input />`.
- **Password:** toggle button should use a mapped `InputGroupButton` size (today `icon-sm` is
  fixed).
- **Number:** vertical steppers use `InputGroupButton` and custom `h-[calc((100%-2px)/2)]`; re-check
  after group height is size-aware.

`InputGroupInput` in the override already forwards `size` to `Input`:

```108:116:registry/uxio/overrides-input-group-base/input-group.tsx
function InputGroupInput({ className, size, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="input-group-control"
      size={size}
      className={cn("cn-input-group-input flex-1", className)}
      {...props}
    />
  )
}
```

Prefer using **`InputGroupInput`** where the implementation is equivalent to raw `Input` + slot, for
consistency (optional refactor).

---

## Docs and examples

For each input doc under `content/docs/inputs/base/` and `content/docs/inputs/radix/`:

- Document the `size` prop and point to the Input override sizing (same as Button).
- Add **ComponentPreview** examples mirroring the override pattern, e.g.
  `base/input-password-size-xs` … `lg` (or one doc section with all sizes), consistent with
  `content/docs/overrides/*/input.mdx`.

Add matching files under `src/examples/base/` and `src/examples/radix/`, and register previews
wherever `ComponentPreview` names are listed (e.g. `src/routes/index.tsx` or the docs routing map —
follow existing `input-size-*` examples for plain Input).

---

## `registry.config.json`

Update **descriptions** for the six input items to mention size variants (optional but keeps
registry metadata accurate). No new `registryDependencies` if `input` is already pulled in via
`input-group` and components import the override `Input` / `inputVariants`.

---

## Verification checklist

1. **Build:** `pnpm` script used in this repo for registry (e.g. `build-registry` or `pnpm build`)
   completes without errors.
2. **Visual:** All five themes — compare each custom input at `xs`/`sm`/`default`/`lg` next to
   `<Input size="…" />` and `<Button size="…" />` on the same page.
3. **A11y:** `data-size` and focus rings still line up; segmented controls still expose correct
   roles/labels.
4. **Radix + base:** Parity between `inputs-*-base` and `inputs-*-radix` files.

---

## Files likely touched (summary)

| Area       | Files                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Components | `registry/uxio/inputs-input-*/**/*.tsx` (12 files)                                                                                        |
| Themes     | `registry/styles/style-lyra.css`, `style-vega.css`, `style-nova.css`, `style-mira.css`, `style-maia.css` (`cn-input-group` size variants) |
| Docs       | `content/docs/inputs/base/*.mdx`, `content/docs/inputs/radix/*.mdx` for the six inputs                                                    |
| Examples   | `src/examples/base/*`, `src/examples/radix/*` + preview registration                                                                      |
| Metadata   | `registry/uxio/registry.config.json` (descriptions)                                                                                       |

---

## Out of scope (unless you explicitly want it)

- OTP / other inputs not under `inputs-input-*` in this list.
- Changing the **token values** inside `cn-input-size-*` (that would be a design-system change
  across overrides and inputs).
