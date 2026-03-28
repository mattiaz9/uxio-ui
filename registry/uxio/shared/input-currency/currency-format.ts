/** Sample amount guaranteed to produce grouping in most locales. */
const INTL_SAMPLE = 1234567.89

const intlSeparatorCache = new Map<
  string,
  {
    groupChars: string[]
    decimalChar: string
  }
>()

/** Group and decimal characters from Intl for stripping pasted/formatted numeric text. */
export function getIntlSeparators(
  locale: string | undefined,
  currency: string,
): { groupChars: string[]; decimalChar: string } {
  const key = `${locale ?? "\0"}:${currency}`
  const hit = intlSeparatorCache.get(key)
  if (hit) return hit

  const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(
    INTL_SAMPLE,
  )
  const groups = new Set<string>()
  for (const p of parts) {
    if (p.type === "group") groups.add(p.value)
  }
  const decimalChar = parts.find((p) => p.type === "decimal")?.value ?? "."
  const out = { groupChars: [...groups], decimalChar }
  intlSeparatorCache.set(key, out)
  return out
}

export function stripIntlGrouping(raw: string, groupChars: string[]): string {
  if (groupChars.length === 0) return raw
  let s = raw
  for (const g of groupChars) {
    if (g.length === 0) continue
    s = s.split(g).join("")
  }
  return s
}

/**
 * Keep visible text aligned with Intl: digits, leading `-`, locale group characters, and the locale
 * decimal separator (filters junk only). Use {@link stripIntlGrouping} + parse when you need a plain number.
 */
export function sanitizeCurrencyDecimalInput(
  raw: string,
  locale: string | undefined,
  currency: string,
): string {
  const { groupChars, decimalChar } = getIntlSeparators(locale, currency)
  const sortedGroups = [...groupChars].sort((a, b) => b.length - a.length)
  let out = ""
  let i = 0
  const len = raw.length
  while (i < len) {
    const c = raw[i]!
    if (c >= "0" && c <= "9") {
      out += c
      i++
      continue
    }
    if (c === "-" && out.length === 0) {
      out += "-"
      i++
      continue
    }
    if (decimalChar && raw.startsWith(decimalChar, i)) {
      out += decimalChar
      i += decimalChar.length
      continue
    }
    let matched = false
    for (const g of sortedGroups) {
      if (g.length > 0 && raw.startsWith(g, i)) {
        out += g
        i += g.length
        matched = true
        break
      }
    }
    if (matched) continue
    i++
  }
  return out
}

/**
 * Parse a user/Intl numeric fragment (may include grouping) to a finite number, or `null` if incomplete/invalid.
 */
export function parseCurrencyStringToNumber(
  raw: string,
  locale: string | undefined,
  currency: string,
): number | null {
  const { groupChars, decimalChar } = getIntlSeparators(locale, currency)
  const trimmed = raw.trim()
  const stripped = stripIntlGrouping(trimmed, groupChars)

  if (
    stripped === "" ||
    stripped === "-" ||
    stripped === "." ||
    stripped === "," ||
    stripped === "-." ||
    stripped === "-,"
  ) {
    return null
  }

  const forJs =
    decimalChar === "." ? stripped : stripped.replace(decimalChar, ".")
  const parsed = Number(forJs)
  return Number.isFinite(parsed) ? parsed : null
}

export function getCurrencyFractionDigits(locale: string | undefined, currency: string): number {
  const n = new Intl.NumberFormat(locale, { style: "currency", currency })
  return n.resolvedOptions().maximumFractionDigits ?? 2
}

export function roundToCurrencyMinorUnits(value: number, fractionDigits: number): number {
  if (!Number.isFinite(value)) return Number.NaN
  const factor = 10 ** fractionDigits
  return Math.round(value * factor) / factor
}

/** Normalized API decimal string: optional `-`, digits, optional `.` + fraction, trim trailing zeros. */
export function normalizeDecimalString(value: number, fractionDigits: number): string {
  if (!Number.isFinite(value)) return "0"
  const rounded = roundToCurrencyMinorUnits(value, fractionDigits)
  if (rounded === 0 || Object.is(rounded, -0)) {
    return "0"
  }
  const sign = rounded < 0 ? "-" : ""
  const abs = Math.abs(rounded)
  if (fractionDigits === 0) {
    return sign + String(Math.round(abs))
  }
  const fixed = abs.toFixed(fractionDigits)
  const trimmed = fixed.replace(/\.?0+$/, "")
  return sign + trimmed
}

export type CurrencyFormatParts = {
  symbol: string
  numericDisplay: string
  addonAlign: "inline-start" | "inline-end"
}

export function getCurrencyFormatParts(
  locale: string | undefined,
  currency: string,
  amount: number,
): CurrencyFormatParts {
  const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(amount)
  const symbol = parts.filter((p) => p.type === "currency").map((p) => p.value).join("")
  const numericDisplay = parts.filter((p) => p.type !== "currency").map((p) => p.value).join("")
  const currencyIdx = parts.findIndex((p) => p.type === "currency")
  const integerIdx = parts.findIndex((p) => p.type === "integer")
  let addonAlign: "inline-start" | "inline-end" = "inline-start"
  if (integerIdx === -1) {
    addonAlign = "inline-start"
  } else if (currencyIdx < integerIdx) {
    addonAlign = "inline-start"
  } else if (integerIdx < currencyIdx) {
    addonAlign = "inline-end"
  } else {
    addonAlign = "inline-start"
  }
  return { symbol, numericDisplay, addonAlign }
}
