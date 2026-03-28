export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function sanitizeBounds(min?: number, max?: number) {
  const safeMin = isFiniteNumber(min) ? min : undefined
  const safeMax = isFiniteNumber(max) ? max : undefined

  if (safeMin !== undefined && safeMax !== undefined && safeMin > safeMax) {
    return { min: undefined, max: undefined }
  }

  return { min: safeMin, max: safeMax }
}

export function sanitizeInput(raw: string): string {
  let out = ""
  let hasSeparator = false

  for (const [index, char] of Array.from(raw).entries()) {
    if (char >= "0" && char <= "9") {
      out += char
      continue
    }

    if (char === "-" && index === 0 && !out.startsWith("-")) {
      out += char
      continue
    }

    if ((char === "." || char === ",") && !hasSeparator) {
      out += char
      hasSeparator = true
    }
  }

  return out
}

export function parseCommittedValue(value: string): number | null {
  const trimmed = value.trim()
  if (
    trimmed === "" ||
    trimmed === "-" ||
    trimmed === "." ||
    trimmed === "," ||
    trimmed === "-." ||
    trimmed === "-,"
  ) {
    return null
  }

  const parsed = Number(trimmed.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}

export function countFractionDigits(value: string): number {
  const normalized = value.replace(",", ".")
  const [, fraction = ""] = normalized.split(".")
  return fraction.length
}

export function clampNumber(value: number, min?: number, max?: number): number {
  let next = value
  if (min !== undefined) next = Math.max(min, next)
  if (max !== undefined) next = Math.min(max, next)
  return next
}

export function formatNumber(value: number, separator: "." | ",", precision: number): string {
  const fixed = precision > 0 ? value.toFixed(precision) : String(Math.trunc(value))
  const normalized = precision > 0 ? fixed.replace(/\.?0+$/, "") : fixed
  return separator === "," ? normalized.replace(".", ",") : normalized
}

export function getPreferredSeparator(value: string, fallback: "." | ","): "." | "," {
  if (value.includes(",")) return ","
  if (value.includes(".")) return "."
  return fallback
}

export function coerceInitialDisplay(value: string | number | undefined, separator: "." | ","): string {
  if (typeof value === "string") return sanitizeInput(value)
  if (!isFiniteNumber(value)) return ""
  return formatNumber(value, separator, countFractionDigits(String(value)))
}
