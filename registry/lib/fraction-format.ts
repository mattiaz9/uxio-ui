/**
 * Fixed-layout fraction input: numerator, literal ` / `, denominator.
 * Stored value is compact `numerator/denominator` (no spaces), e.g. `2/5`.
 */

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

export function fieldTokens(tokens: FractionFormatToken[]): Extract<
  FractionFormatToken,
  { type: "field" }
>[] {
  return tokens.filter((t): t is Extract<FractionFormatToken, { type: "field" }> => t.type === "field")
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
export function parseSegmentsFromFractionString(
  raw: string,
  maxDigits: number,
): [string, string] {
  const s = raw.trim().replace(/\s+/g, "")
  if (!s) return ["", ""]
  const slash = s.indexOf("/")
  if (slash === -1) {
    const only = s.replace(/\D/g, "").slice(0, maxDigits)
    return [only, ""]
  }
  const n = s.slice(0, slash).replace(/\D/g, "").slice(0, maxDigits)
  const d = s.slice(slash + 1).replace(/\D/g, "").slice(0, maxDigits)
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

/** True when both parts are non-empty and form a valid fraction (denominator ≥ 1). */
export function fractionSegmentsComplete(segments: string[]): boolean {
  const [n, d] = segments
  if (n === undefined || d === undefined) return false
  return normalizeCommittedFraction(n, d) !== null
}
