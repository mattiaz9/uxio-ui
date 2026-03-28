import { clampNumber, sanitizeBounds } from "./numbers"
import {
  getCurrencyFormatParts,
  getCurrencyFractionDigits,
  normalizeDecimalString,
  parseCurrencyStringToNumber,
  roundToCurrencyMinorUnits,
  sanitizeCurrencyDecimalInput,
} from "./currency"

export function computeRoundedAmount(
  n: number,
  locale: string | undefined,
  currency: string,
  min?: number,
  max?: number,
): number {
  const b = sanitizeBounds(min, max)
  const c = clampNumber(n, b.min, b.max)
  const fd = getCurrencyFractionDigits(locale, currency)
  return roundToCurrencyMinorUnits(c, fd)
}

/** Plain decimal for editing (spec: no Intl while typing). Used when focusing after a committed Intl display. */
export function committedAmountToTypingDraft(
  rounded: number,
  locale: string | undefined,
  currency: string,
): string {
  const fd = getCurrencyFractionDigits(locale, currency)
  return normalizeDecimalString(rounded, fd)
}

/** String-controlled: while focused show raw draft; when blurred, if `value` matches the normalized API form, show Intl numeric fragment (parents often echo `onValueChange` only). */
export function getStringControlledDisplay(
  value: string,
  focused: boolean,
  locale: string | undefined,
  currency: string,
  min?: number,
  max?: number,
): string {
  const sanitized = sanitizeCurrencyDecimalInput(value, locale, currency)
  if (focused) return sanitized
  const parsed = parseCurrencyStringToNumber(sanitized, locale, currency)
  if (parsed === null) return sanitized
  const bounds = sanitizeBounds(min, max)
  const fd = getCurrencyFractionDigits(locale, currency)
  const clamped = clampNumber(parsed, bounds.min, bounds.max)
  const rounded = roundToCurrencyMinorUnits(clamped, fd)
  const canonical = normalizeDecimalString(rounded, fd)
  const fromParsedOnly = normalizeDecimalString(parsed, fd)
  if (canonical !== fromParsedOnly) return sanitized
  return getCurrencyFormatParts(locale, currency, rounded).numericDisplay
}
