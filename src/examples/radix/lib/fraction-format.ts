import { clampNumber, sanitizeBounds } from "./numbers"

export type FractionFormatToken =
  | { type: "literal"; text: string }
  | { type: "field"; kind: "numerator" | "denominator"; pattern: string }

/** Visual separator between segments (spaces around slash). */
export const FRACTION_DISPLAY_LITERAL = " / " as const

export function fractionTokens(maxDigits: number): FractionFormatToken[] {
  const pattern = "n".repeat(Math.max(1, maxDigits))
  return [
    { type: "field", kind: "numerator", pattern },
    { type: "literal", text: FRACTION_DISPLAY_LITERAL },
    { type: "field", kind: "denominator", pattern },
  ]
}

export function fieldTokens(
  tokens: FractionFormatToken[],
): Extract<FractionFormatToken, { type: "field" }>[] {
  return tokens.filter(
    (t): t is Extract<FractionFormatToken, { type: "field" }> => t.type === "field",
  )
}

export function composeFractionDisplay(tokens: FractionFormatToken[], segments: string[]): string {
  let si = 0
  let out = ""
  for (const t of tokens) {
    if (t.type === "literal") out += t.text
    else {
      out += segments[si] ?? ""
      si++
    }
  }
  return out
}

/** Hidden input / form value: `n/d` with no spaces. */
export function compactFractionValue(numerator: string, denominator: string): string {
  const n = numerator.replace(/\D/g, "")
  const d = denominator.replace(/\D/g, "")
  if (!n && !d) return ""
  return `${n}/${d}`
}

/**
 * Parse a compact or spaced fraction string into two digit segments (trimmed to maxDigits each).
 */
export function parseSegmentsFromFractionString(raw: string, maxDigits: number): [string, string] {
  const s = raw.trim().replace(/\s+/g, "")
  if (!s) return ["", ""]
  const slash = s.indexOf("/")
  if (slash === -1) {
    const only = s.replace(/\D/g, "").slice(0, maxDigits)
    return [only, ""]
  }
  const n = s.slice(0, slash).replace(/\D/g, "").slice(0, maxDigits)
  const d = s
    .slice(slash + 1)
    .replace(/\D/g, "")
    .slice(0, maxDigits)
  return [n, d]
}

/** Integer ≥ 0 / ≥ 1, normalized `n/d` string, or null if invalid. */
export function normalizeCommittedFraction(numerator: string, denominator: string): string | null {
  const n = numerator.replace(/\D/g, "")
  const d = denominator.replace(/\D/g, "")
  if (!n || !d) return null
  const ni = parseInt(n, 10)
  const di = parseInt(d, 10)
  if (!Number.isFinite(ni) || !Number.isFinite(di) || di < 1 || ni < 0) return null
  return `${ni}/${di}`
}

/** Optional inclusive bounds per segment (uses `sanitizeBounds` + `clampNumber` from number inputs). */
export type FractionBounds = {
  minNumerator?: number
  maxNumerator?: number
  /** When omitted, denominator still uses a minimum of `1` (same as unbounded validation). */
  minDenominator?: number
  maxDenominator?: number
}

function isFiniteBound(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n)
}

export function hasFractionBounds(bounds: FractionBounds | undefined): boolean {
  if (!bounds) return false
  return (
    isFiniteBound(bounds.minNumerator) ||
    isFiniteBound(bounds.maxNumerator) ||
    isFiniteBound(bounds.minDenominator) ||
    isFiniteBound(bounds.maxDenominator)
  )
}

/**
 * After parsing digit strings, clamp each integer to optional bounds, then validate like
 * `normalizeCommittedFraction` (numerator ≥ 0, denominator ≥ 1).
 */
export function normalizeCommittedFractionWithBounds(
  numerator: string,
  denominator: string,
  bounds: FractionBounds | undefined,
  maxDigits: number,
): string | null {
  if (!bounds || !hasFractionBounds(bounds)) {
    return normalizeCommittedFraction(numerator, denominator)
  }
  const b = bounds
  const n = numerator.replace(/\D/g, "")
  const d = denominator.replace(/\D/g, "")
  if (!n || !d) return null
  let ni = parseInt(n, 10)
  let di = parseInt(d, 10)
  if (!Number.isFinite(ni) || !Number.isFinite(di)) return null

  const numB = sanitizeBounds(b.minNumerator, b.maxNumerator)
  const denB = sanitizeBounds(b.minDenominator ?? 1, b.maxDenominator)
  ni = clampNumber(ni, numB.min, numB.max)
  di = clampNumber(di, denB.min, denB.max)

  if (di < 1 || ni < 0) return null
  const ns = String(ni).slice(0, maxDigits)
  const ds = String(di).slice(0, maxDigits)
  const nii = parseInt(ns, 10)
  const dii = parseInt(ds, 10)
  if (!Number.isFinite(nii) || !Number.isFinite(dii) || dii < 1 || nii < 0) return null
  return `${nii}/${dii}`
}

/**
 * Clamp parsed segment strings for controlled `value` sync so the UI does not show out-of-range
 * integers. Empty segments stay empty.
 */
export function clampFractionStringsForDisplay(
  numerator: string,
  denominator: string,
  bounds: FractionBounds | undefined,
  maxDigits: number,
): [string, string] {
  const nRaw = numerator.replace(/\D/g, "").slice(0, maxDigits)
  const dRaw = denominator.replace(/\D/g, "").slice(0, maxDigits)
  if (!bounds || !hasFractionBounds(bounds)) {
    return [nRaw, dRaw]
  }
  const b = bounds
  const numB = sanitizeBounds(b.minNumerator, b.maxNumerator)
  const denB = sanitizeBounds(b.minDenominator ?? 1, b.maxDenominator)
  let nOut = nRaw
  let dOut = dRaw
  if (nOut) {
    const ni = clampNumber(parseInt(nOut, 10), numB.min, numB.max)
    nOut = String(Math.trunc(ni)).slice(0, maxDigits)
  }
  if (dOut) {
    const di = clampNumber(parseInt(dOut, 10), denB.min, denB.max)
    dOut = String(Math.trunc(di)).slice(0, maxDigits)
  }
  return [nOut, dOut]
}

/** True when both parts are non-empty and form a valid fraction (denominator ≥ 1). */
export function fractionSegmentsComplete(
  segments: string[],
  bounds?: FractionBounds,
  maxDigits = 6,
): boolean {
  const [n, d] = segments
  if (n === undefined || d === undefined) return false
  if (!bounds || !hasFractionBounds(bounds)) {
    return normalizeCommittedFraction(n, d) !== null
  }
  return normalizeCommittedFractionWithBounds(n, d, bounds, maxDigits) !== null
}
