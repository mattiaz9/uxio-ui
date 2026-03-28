# Input Currency — Design Spec

**Status:** Approved (2026-03-28)  
**Context:** New registry component `input-currency`, documented and exemplified like `input-number`. Primary behavioral reference: `registry/uxio/inputs-input-number-{radix|base}/input-number.tsx`.

## Summary

`InputCurrency` is a money field built on **Input Group**: an **addon** shows the **currency symbol** (from **`currency`** + **Intl**); the **text field** holds only the **numeric** content. Addon is **inline-start or inline-end** per **Symbol placement** below—not always leading. While the user is typing, the field behaves like a **plain decimal text input** (filtered characters, no grouping, no symbol inside the input, no Intl formatting). **After commit** (blur or Enter), the visible value updates to the **Intl-formatted** numeric portion; the prefix shows the symbol. **`onValueChange`** emits a **normalized decimal string** (API-friendly), not a `number`.

## Non-goals (v1)

- Step buttons, **ArrowUp/ArrowDown changing the value** (do not attach step handlers; keys behave like a normal text field aside from commit on Enter), or wheel-based changes to the value (wheel should be prevented like `input-number`).
- Validating or recovering from invalid ISO 4217 `currency` codes beyond documenting that callers must pass valid codes.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currency` | `string` | Yes | ISO 4217 code (`USD`, `EUR`, `CAD`, …). Drives symbol, minor units for rounding, and Intl currency options. |
| `locale` | `string \| undefined` | No | Passed to `Intl`. **`undefined`** uses the runtime default locale (same as `new Intl.NumberFormat(undefined, …)`). |
| `value` | `string \| number \| undefined` | No | Controlled mode, aligned with `InputNumber`: string controls draft text; number controls numeric state with draft overlay while editing. |
| `defaultValue` | `string \| number \| undefined` | No | Uncontrolled initial value. |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | No | Fires when visible string changes (each keystroke and when display updates on commit). |
| `onValueChange` | `(value: string \| null) => void` | No | Fires **only on commit** when the committed value changes. **`string`**: normalized decimal; **`null`**: empty, incomplete, or non-parseable committed state. |
| `min` | `number \| undefined` | No | Optional minimum; clamp after parse. Ignored if `min > max` (same sanitization as `InputNumber`). |
| `max` | `number \| undefined` | No | Optional maximum; clamp after parse. |
| — | — | — | All other props from the underlying `Input`, except `type`, `value`, `defaultValue`, and `onChange` (replaced by this contract). |

**Removed vs `InputNumber`:** no `step` prop.

## Typing behavior

- Reuse the **same sanitization idea** as `input-number`: digits, optional leading `-`, single decimal separator (`.` or `,` normalized at parse time as today).
- **No** Intl formatting, **no** thousands grouping, **no** currency symbol in the editable field while typing between commits.

## Symbol placement (Intl order)

Use `Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(amount)` and:

1. **Symbol text:** concatenate all parts with `type === 'currency'`.
2. **Numeric display:** concatenate all **non-currency** parts in order (integer, group, decimal, fraction, literal as needed) so the symbol does not appear in the input.
3. **Addon alignment:** If the **first** `currency` part appears **before** the **first** `integer` part in the parts array, render the symbol in **`InputGroupAddon` `align="inline-start"`**. If the first `currency` part appears **after** any numeric content (typical for `€` trailing in some locales), render the symbol in **`align="inline-end"`**. This keeps the symbol on the correct side for that locale instead of forcing a leading-only layout.

## Commit behavior

**Triggers:** **blur** and **Enter** (same family as `input-number` for committing text). **ArrowUp/ArrowDown** must **not** change the value or trigger commit (no `input-number`-style stepping).

**On commit:**

1. Parse sanitized text to a numeric amount; empty or incomplete drafts yield **`onValueChange(null)`** (mirror `InputNumber`’s `null` semantics).
2. If parse succeeds: **clamp** to `min`/`max` when defined.
3. **Round** to the **default fraction digits** for `currency` (e.g. 2 for USD/EUR, 0 for JPY), consistent with that currency’s minor units / `Intl` behavior.
4. Emit **`onValueChange`** with a **normalized** string: optional leading `-`, digits, a single `.` as decimal separator, no thousands separators, **trim trailing zeros** in the fractional part while preserving a valid decimal representation. **Examples (illustrative):** `"-1234.5"` not `"-1234.50"`; `"10"` not `"10.0"` after trim; JPY-style zero fraction digits yields integers only (e.g. `"1200"`).
5. Refresh **display** using **Symbol placement**: put the currency symbol in the **inline-start** or **inline-end** addon per § Symbol placement; the input shows the joined non-currency parts only.

**Deduping:** Apply the same “last committed value” guard as `InputNumber` so identical consecutive commits do not spam `onValueChange`.

## Registry and layout

- **Two implementations:** `registry/uxio/inputs-input-currency-radix/input-currency.tsx` and `registry/uxio/inputs-input-currency-base/input-currency.tsx`, mirroring `input-number` import paths (radix vs base `Input` / `InputGroup`).
- **`registry/uxio/registry.config.json`:** new item `input-currency`, `registry:ui`, category `inputs`, `registryDependencies`: `["@uxio/input-group"]`, dependencies aligned with `input-number` (omit `lucide-react` if no icons are used).
- **Docs:** `content/docs/inputs/radix/input-currency.mdx` and `content/docs/inputs/base/input-currency.mdx` (Overview, props table, Install `@uxio/input-currency`, Usage examples, `ComponentPreview`).
- **Nav:** Update `content/docs/inputs/meta.json` (or equivalent) to include the new pages.
- **Examples:** `src/examples/radix/input-currency-default.tsx` and `src/examples/base/input-currency-default.tsx` with preview names `radix/input-currency-default` and `base/input-currency-default`.
- **Tests:** `tests/input-currency/input-currency-radix.test.tsx` and `tests/input-currency/input-currency-base.test.tsx`.

**Repo constraints:** Do not modify `components.json`, `src/components/ui/`, or `src/styles/app.css` for registry work (per project rules).

## Implementation approach

- **v1:** Implement by adapting the `input-number` flow (sanitize, parse, commit, controlled modes) in each `input-currency` file; **remove** step UI; add **inline-start or inline-end** addon for the symbol per § Symbol placement; swap post-commit display for Intl `formatToParts` split. Optional follow-up: extract tiny shared helpers under `registry/uxio/shared/` if duplication becomes painful.

## Testing focus

- Sanitization while typing; no formatting mid-edit.
- Commit via blur and Enter; normalized string shape with fixed `locale` + `currency` in tests.
- `onValueChange(null)` for empty/invalid.
- Clamp with `min`/`max`.
- Addon shows expected **Intl** symbol for chosen `currency` + `locale` (correct **start vs end** for that locale when using the placement rule).

## Open questions resolved in design

| Topic | Decision |
|-------|----------|
| Variants | Base + radix, same as `input-number`. |
| Emitted value | Normalized decimal **string**, not `number`. |
| Locale | Optional; default runtime locale. |
| UI | Currency symbol in **inline-start or inline-end** addon (per Intl parts order); **no** up/down buttons. |
| API string | Normalized (`.` decimal, no grouping). |
