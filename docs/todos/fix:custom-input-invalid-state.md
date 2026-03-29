---
title: Leverage tailwind aria-invalid variant to change the text color of all the custom inputs
---

We should look at the base input component as reference.

## Problem

- **Native inputs** (`registry/uxio/overrides-input-base/input.tsx` + `.cn-input` in `registry/styles/style-*.css`) already get **border and ring** from `aria-invalid:*` utilities, but **typed value color** does not shift to the destructive palette when invalid.
- **Custom / composite inputs** (fraction, duration, datetime, number, currency, password) sit inside `InputGroup` (`.cn-input-group`). The shell already reacts to `has-[[data-slot][aria-invalid=true]]` for border/ring, but inner regions use `.cn-input-group-input` (borderless) and **segment or wrapper elements do not receive `aria-invalid`**, so Tailwind’s `aria-invalid:` variant never drives **text** color for the visible value.
- Form libraries and `Field` typically set `aria-invalid` on the control passed to the controller; those props must be **merged onto the correct focus target** (native `Input` vs segmented `div` / hidden + control).

## Goal

- Use Tailwind’s **`aria-invalid:`** (and, where needed, **group / parent `has-[[data-slot][aria-invalid=true]]:`** on `.cn-input-group`) so invalid values read in **destructive foreground**, aligned with `.cn-field` / error messaging, without breaking literals, placeholders, or addons that should stay muted unless specified.

## Implementation tasks

### 1. Styles — base input text (`registry/styles/style-*.css`)

1. In the **`.cn-input`** block of each theme file (`style-maia.css`, `style-mira.css`, `style-lyra.css`, `style-nova.css`, `style-vega.css`), add **`aria-invalid:text-destructive`** (or the same token the design system uses for invalid value text—match `.cn-field-error` / destructive foreground).
2. Confirm **file inputs** and **placeholder** still look correct (`placeholder:` and `file:` utilities should win where they must; adjust order or scope if a conflict appears).

### 2. Styles — input group shell and inner control (`registry/styles/style-*.css`)

1. On **`.cn-input-group`**, add utilities so when any descendant matches **`[data-slot][aria-invalid=true]`** (existing border/ring pattern), **default value text** inside the group can turn destructive, e.g. **`has-[[data-slot][aria-invalid=true]]:text-destructive`**, plus targeted overrides so **addons** (`.cn-input-group-addon`, `.cn-input-group-text`) and **static literals** (e.g. `/` in fraction) remain **muted** unless product wants them emphasized—often **`has-...:[&_.cn-input-group-text]:text-muted-foreground`** (or equivalent) to reset addon copy.
2. On **`.cn-input-group-input`** and **`.cn-input-group-textarea`**, add **`aria-invalid:text-destructive`** alongside the existing **`aria-invalid:ring-0`** so native controls inside groups still get explicit invalid text when they carry `aria-invalid`.
3. Rebuild / spot-check **combobox** and other consumers that reuse input-group patterns so no unintended color bleed occurs.

### 3. Components — forward `aria-invalid` (and related a11y) onto the real control

For each custom input, extend the public props so **`React.ComponentProps<"input">` / `Field` control props** can include **`aria-invalid`**, **`aria-describedby`**, and **`id`** as needed, and apply them to the element that is the **actual focus target** for the control:

| Area | Registry paths (base + radix) |
|------|-------------------------------|
| Fraction | `registry/uxio/inputs-input-fraction-base/input-fraction.tsx`, `...-radix/...` |
| Duration | `registry/uxio/inputs-input-duration-base/input-duration.tsx`, `...-radix/...` |
| Datetime | `registry/uxio/inputs-input-datetime-base/input-datetime.tsx`, `...-radix/...` |
| Number | `registry/uxio/inputs-input-number-base/input-number.tsx`, `...-radix/...` |
| Currency | `registry/uxio/inputs-input-currency-base/input-currency.tsx`, `...-radix/...` |
| Password | `registry/uxio/inputs-input-password-base/input-password.tsx`, `...-radix/...` |

Concrete steps per component:

1. **Pick the node that must carry `aria-invalid`:** usually the **visible interactive root** (`data-slot` matching the existing group selector, e.g. control wrapper with `cn-input-group-input` or `data-slot="input-group-control"`). For a **hidden native input + segmented UI**, prefer putting **`aria-invalid` on the focusable segment container** (or the element that already exposes `role="textbox"`), not only on `aria-hidden` inputs.
2. **Spread** `aria-invalid`, `aria-describedby`, and **`id`** (if the hidden input owns `id`, wire **`aria-labelledby` / `aria-describedby`** consistently so labels and errors still associate).
3. Avoid duplicate **`id`** between hidden and visible controls; follow the same pattern as other registry fields.

### 4. Verification

1. **`src/examples/`** — In a form example (e.g. `form-registration` base + radix), force an invalid state (submit with schema errors or `aria-invalid` manually) and confirm **border, ring, and text** for native `Input`, `InputGroupInput`, and at least one **segmented** custom input.
2. Run **`pnpm` / `npm` script that builds the registry** (e.g. `build-registry` or project equivalent) so published JSON and import rewrites stay valid.
3. Quick **keyboard / screen reader** pass: invalid fraction/duration still expose one logical control and announce invalid state if the platform reads `aria-invalid` on the focused node.

## Notes

- **Reference:** `registry/uxio/overrides-input-base/input.tsx` uses **`cn-input`**; theme tokens for invalid chrome live next to **`.cn-input`** in `registry/styles/style-*.css`.
- **InputGroup** primitives: `registry/uxio/overrides-input-group-base/input-group.tsx` (`InputGroupInput` already sets `data-slot="input-group-control"`). Composite inputs may use a different `data-slot` on the inner control; the CSS selector **`[data-slot][aria-invalid=true]`** is intentionally generic—any `data-slot` value counts as long as **`aria-invalid`** is set on that node.
