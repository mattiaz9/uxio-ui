---
title: Add min/max for numerator and denominator in input-fraction
---

## Goal

Allow optional **numeric bounds** on the numerator and denominator segments of `InputFraction`, analogous to `min` / `max` on native number inputs and to [`input-number`](../../registry/uxio/inputs-input-number-radix/input-number.tsx) (which uses `sanitizeBounds` + `clampNumber`).

Stored and emitted values remain compact `n/d` strings (e.g. `2/5`). Bounds apply to the **integer** in each segment after digit parsing, not to the rational value `n/d` as a single number (unless you later add a separate feature for that).

---

## API (proposal)

Add optional props on `InputFraction` (both `inputs-input-fraction-base` and `inputs-input-fraction-radix`):

| Prop | Type | Notes |
|------|------|--------|
| `minNumerator` | `number` (optional) | Inclusive lower bound for the numerator integer. |
| `maxNumerator` | `number` (optional) | Inclusive upper bound. |
| `minDenominator` | `number` (optional) | Inclusive lower bound; align with existing rule **denominator ≥ 1** when no `minDenominator` is set. |
| `maxDenominator` | `number` (optional) | Inclusive upper bound. |

**Behavior (align with `input-number`):**

- Resolve `min`/`max` pairs with the same “swap if reversed” logic as `sanitizeBounds` in the number input (or share a tiny helper under `registry/lib/` if it stays dependency-free).
- **Commit path:** When a fraction is committed (`normalizeCommittedFraction` / `onValueChange`), clamp numerator and denominator into range (order: parse integers → clamp each segment → re-emit). Empty / incomplete segments keep current behavior.
- **Typing path:** Prefer **clamp on commit** for simplicity; optionally block or clamp digit entry so users cannot type obviously out-of-range values (document whichever you choose).
- **Controlled `value`:** When `value` is set from outside, parse segments and clamp to bounds in the same way as committed input so the UI does not show out-of-range numbers.

**Edge cases to decide in implementation:**

- If clamping produces `0` numerator or `0` denominator, treat as invalid / empty like today’s `normalizeCommittedFraction` rules.
- Conflicting bounds vs `maxDigits` (e.g. max value needs more digits than allowed): document or assert; typically bounds should fit in `maxDigits` or clamp still applies to the numeric value with string truncation last.

---

## Implementation tasks

### 1. Shared math / parsing (`registry/lib/fraction-format.ts`)

- [ ] Add helpers for bound sanitization (reuse or mirror `sanitizeBounds` from the number input lib if exported/shared, without pulling UI).
- [ ] Extend validation/normalization so committed `[numerator, denominator]` integers can be **clamped** to optional min/max per segment, then serialized back to digit strings (respecting `maxDigits` truncation if needed).
- [ ] Keep `normalizeCommittedFraction` behavior for the unbounded case; either overload it or add `normalizeCommittedFractionWithBounds(..., bounds)` and call from the component.
- [ ] Add unit tests for the pure functions (Vitest colocated or under `tests/` for `fraction-format` if a pattern exists).

### 2. Component — both registry variants

- [ ] `registry/uxio/inputs-input-fraction-base/input-fraction.tsx`
- [ ] `registry/uxio/inputs-input-fraction-radix/input-fraction.tsx`

For each:

- [ ] Add the four optional props; document them in the `InputFractionProps` JSDoc block.
- [ ] Thread bounds into commit, flush, and controlled `value` sync effects so external values are clamped consistently.
- [ ] If implementing **live** digit constraints in `onKeyDown`, ensure behavior matches commit/clamp semantics (no contradictory states between partial input and blur).

### 3. Tests

- [ ] `tests/input-fraction/input-fraction-base.test.tsx` — cases: commit clamps numerator/denominator; controlled value from parent is clamped; optional: typing stays within bounds if you implement live clamping.
- [ ] `tests/input-fraction/input-fraction-radix.test.tsx` — same scenarios (keep parity with base).

### 4. Docs and examples (site)

- [ ] `content/docs/inputs/base/input-fraction.mdx` and `content/docs/inputs/radix/input-fraction.mdx` — describe the new props and behavior.
- [ ] Optional: add `src/examples/{base,radix}/input-fraction-min-max.tsx` and register a `<ComponentPreview />` if you want a visible demo (follow existing examples like `input-fraction-max-digits`).

### 5. Registry metadata

- [ ] Update the `input-fraction` item **description** in `registry/uxio/registry.config.json` if the public one-liner should mention min/max.
- [ ] Run `scripts/build-registry.ts` (or the project’s registry build) after changes so published JSON stays correct.

### 6. Verification

- [ ] `pnpm test` (or repo equivalent) for fraction tests.
- [ ] Quick manual check in dev on base + radix doc previews for bounded fractions.

---

## Files to touch (checklist)

| Area | Paths |
|------|--------|
| Core logic | `registry/lib/fraction-format.ts` |
| UI | `registry/uxio/inputs-input-fraction-base/input-fraction.tsx`, `registry/uxio/inputs-input-fraction-radix/input-fraction.tsx` |
| Tests | `tests/input-fraction/input-fraction-base.test.tsx`, `tests/input-fraction/input-fraction-radix.test.tsx` |
| Docs | `content/docs/inputs/base/input-fraction.mdx`, `content/docs/inputs/radix/input-fraction.mdx` |
| Examples (optional) | `src/examples/base/input-fraction-*.tsx`, `src/examples/radix/input-fraction-*.tsx`, route registrations if required |
| Registry | `registry/uxio/registry.config.json`, rebuild registry script output |
