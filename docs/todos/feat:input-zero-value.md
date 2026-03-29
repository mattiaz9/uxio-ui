---
title: Custom input with segments components should handle a typed '0' value
---

## Problem

When typing `0` the value remains muted or empty (placeholder or empty string).

## Root cause (current behavior)

In `registry/lib/duration-format.ts`, segment digit strings use **empty string for numeric zero** in two places:

- `normalizeDurationDigitMaps` — after carry normalization, each field maps `n === 0` to `""`.
- `totalSecondsToSegmentDigits` — decomposing total seconds into segments does the same.

The UI (`InputDuration` base + radix) treats `raw === ""` as placeholder styling (`text-muted-foreground` / per-char muted) and uses `formatSegmentDisplay` to show **padded zeros** for empty raw input. So a committed or controlled value of **0** looks indistinguishable from “no value typed” (all muted placeholder digits), and a user who types `0` and blurs often ends back in the empty representation after normalization.

Other segmented inputs to verify after fixing duration:

- **Input fraction** — numerator `0` is valid (`0/d`); confirm `compactFractionValue` / commit paths do not drop `"0"` (strings are generally fine).
- **Input datetime** — confirm any `0` month/day/hour edge cases match product expectations (may already use fixed-width digit runs).

Non-segment **Input number** uses `isFiniteNumber` / `formatNumber`; `0` is finite and should display; only re-open if a repro exists with string `value` or uncontrolled defaults.

---

## Goal

- A segment that represents the integer **zero** should use a real digit display state (e.g. raw `"0"` or fixed-width `"00"` per pattern), **not** the same representation as “empty / not yet filled” unless the product explicitly treats “all zeros” as empty.
- After blur / Enter / controlled `value={0}`, duration inputs should not collapse typed zeros into placeholder-only appearance when the stored seconds value is zero.

---

## Implementation tasks

### 1. Duration formatting (`registry/lib/duration-format.ts`)

1. **Single representation rule** — Replace `n === 0 ? "" : String(n)` with a rule that preserves **explicit zero** as digits in the segment string:
   - Prefer `String(n)` for all `n >= 0`, **or** use `formatSegmentDisplay(String(n), getFieldMinWidth(f))` when building per-field strings so width matches the field pattern (may require threading `fields` / `minWidth` into helpers where only `n` is returned today).
2. **`normalizeDurationDigitMaps`** — Return segment strings that still reflect zero numerically (no silent `""` for zero). Adjust any downstream code that assumed `""` meant zero (see task 2).
3. **`totalSecondsToSegmentDigits`** — Emit digit strings for zero units that are consistent with task 1 (so `value={0}` does not show as all-placeholder segments).
4. **`backspaceDigitRtl`** — Decide behavior when deleting the last digit of a segment: if the numeric value becomes `0`, return `"0"` vs `""` vs pattern-padded zero; align with “empty segment” vs “zero value” semantics from task 1 (likely: empty only when user cleared the field entirely, not when value is numerically zero—document the chosen rule).
5. **“All segments empty” vs “all zeros”** — `InputDuration` `commitNormalized` uses `segs.every((s) => s === "")` to emit `null`. If zeros are no longer `""`, define whether **all segments showing `0`** maps to `emitSeconds(0)` vs `emitSeconds(null)` and update the empty-check accordingly (e.g. treat “no digits” vs “all parsed values zero” differently).

### 2. Duration components (`inputs-input-duration-base`, `inputs-input-duration-radix`)

1. Re-read `commitNormalized`, controlled `value` sync (`useEffect` with `totalSecondsToSegmentDigits`), and placeholder styling (`isPlaceholder = raw === ""`) so they match the new string rules from task 1.
2. If placeholder vs filled styling needs to key off something other than `raw === ""` (e.g. committed vs draft), adjust minimally without breaking a11y labels.

### 3. Tests and examples

1. Add or extend unit tests for `duration-format.ts` (normalize + `totalSecondsToSegmentDigits` + backspace) covering `0` seconds, single-segment `0`, and multi-segment carry leaving zeros.
2. Manually verify (or add example stories) for radix + base duration: type `0`, blur, controlled `value={0}`, and `null` empty state still distinct.

### 4. Registry build

1. Run `pnpm` / project script for registry build if required by CI (`scripts/build-registry.ts`) after changing `registry/lib` or registry components.

---

## Acceptance criteria

- Typing `0` in a duration segment and committing shows **non-placeholder** styling for that zero (consistent with other non-zero digits), unless the design explicitly reserves muted styling for leading zeros only.
- `value={0}` on `InputDuration` does not present as identical to `value={null}` in a way that hides the fact that the value is zero (unless product decides they must look the same—in that case, document the exception).
- No regression for empty/clear behavior: clearing all segments still yields `null` / empty hidden value as today.
