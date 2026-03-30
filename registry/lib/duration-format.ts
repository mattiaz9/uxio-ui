import { fieldCharToKind, fieldTokens, type FieldKind, type FormatToken } from "./datetime-format"

export type DurationParts = Partial<
  Record<"years" | "months" | "days" | "hours" | "minutes" | "seconds", number>
>

const PART_KEY: Record<FieldKind, keyof DurationParts> = {
  year: "years",
  month: "months",
  day: "days",
  hour: "hours",
  minute: "minutes",
  second: "seconds",
}

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86400
/** Approximate month length for total-seconds conversion (30 days). */
const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY
/** Approximate year length for total-seconds conversion (365 days). */
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY

/** Default pattern matching `InputDuration` (quoted unit literals between fields). */
export const DEFAULT_DURATION_FORMAT = "HH'h' mm'm' ss's'"

export function tokenizeDurationFormat(fmt: string): FormatToken[] {
  const tokens: FormatToken[] = []
  let i = 0
  while (i < fmt.length) {
    const c = fmt.charAt(i)
    if (c === "'") {
      i++
      let inner = ""
      while (i < fmt.length) {
        if (fmt.charAt(i) === "'") {
          if (fmt.charAt(i + 1) === "'") {
            inner += "'"
            i += 2
            continue
          }
          i++
          break
        }
        inner += fmt.charAt(i)
        i++
      }
      tokens.push({ type: "literal", text: inner })
      continue
    }
    if ("yMdHms".includes(c)) {
      let j = i + 1
      while (j < fmt.length && fmt.charAt(j) === c) j++
      const pattern = fmt.slice(i, j)
      tokens.push({ type: "field", kind: fieldCharToKind(c), pattern })
      i = j
      continue
    }
    let j = i + 1
    while (j < fmt.length && fmt.charAt(j) !== "'" && !"yMdHms".includes(fmt.charAt(j))) {
      j++
    }
    tokens.push({ type: "literal", text: fmt.slice(i, j) })
    i = j
  }
  return tokens
}

export function getFieldMinWidth(field: Extract<FormatToken, { type: "field" }>): number {
  return Math.max(1, field.pattern.length)
}

/** Concatenate segment strings with literal tokens (variable-length segments). */
export function composeDurationSegments(tokens: FormatToken[], segments: string[]): string {
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

/**
 * Parse a composed string into digit runs per field. Each field consumes a maximal digit substring
 * (possibly empty).
 */
export function parseVariableDurationSegments(str: string, tokens: FormatToken[]): string[] {
  const fields = fieldTokens(tokens)
  const segments = fields.map(() => "")
  let pos = 0
  let fieldIdx = 0
  for (const t of tokens) {
    if (t.type === "literal") {
      if (str.slice(pos, pos + t.text.length) === t.text) {
        pos += t.text.length
      } else {
        break
      }
    } else {
      const idx = fieldIdx
      fieldIdx += 1
      let buf = ""
      while (pos < str.length && /\d/.test(str.charAt(pos))) {
        buf += str.charAt(pos)
        pos++
      }
      segments[idx] = buf
    }
  }
  return segments
}

function hasKind(fields: Extract<FormatToken, { type: "field" }>[], kind: FieldKind): boolean {
  return fields.some((f) => f.kind === kind)
}

function parseSegDigits(raw: string): number {
  if (raw === "" || raw === undefined) return 0
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/**
 * Applies overflow carry from smallest to largest unit. Rules:
 * - seconds → minutes (/60) if minutes exist; else unbounded
 * - minutes → hours (/60) if hours exist; else unbounded
 * - hours → days (/24) if days exist; else unbounded
 * - days → months (/30) if months exist (matches approximate month length in total seconds); else
 *   days → years (/365) if years exist; else unbounded
 * - months → years (/12) if years exist; else unbounded
 */
export function normalizeDurationDigitMaps(
  fields: Extract<FormatToken, { type: "field" }>[],
  segmentDigits: string[],
): string[] {
  const v: Record<FieldKind, number> = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  }
  fields.forEach((f, i) => {
    v[f.kind] = parseSegDigits(segmentDigits[i] ?? "")
  })

  const hasS = hasKind(fields, "second")
  const hasM = hasKind(fields, "minute")
  const hasH = hasKind(fields, "hour")
  const hasD = hasKind(fields, "day")
  const hasMo = hasKind(fields, "month")
  const hasY = hasKind(fields, "year")

  if (hasS && hasM) {
    v.minute += Math.floor(v.second / 60)
    v.second %= 60
  }
  if (hasM && hasH) {
    v.hour += Math.floor(v.minute / 60)
    v.minute %= 60
  }
  if (hasH && hasD) {
    v.day += Math.floor(v.hour / 24)
    v.hour %= 24
  }
  if (hasD && hasMo) {
    v.month += Math.floor(v.day / 30)
    v.day %= 30
  } else if (hasD && hasY && !hasMo) {
    v.year += Math.floor(v.day / 365)
    v.day %= 365
  }
  if (hasMo && hasY) {
    v.year += Math.floor(v.month / 12)
    v.month %= 12
  }

  return fields.map((f) => {
    const n = v[f.kind]
    return String(n)
  })
}

export function durationPartsFromDigitMap(
  fields: Extract<FormatToken, { type: "field" }>[],
  segmentDigits: string[],
): DurationParts {
  const parts: DurationParts = {}
  fields.forEach((f, i) => {
    const n = parseSegDigits(segmentDigits[i] ?? "")
    parts[PART_KEY[f.kind]] = n
  })
  return parts
}

export function totalSecondsFromParts(parts: DurationParts): number {
  const y = parts.years ?? 0
  const mo = parts.months ?? 0
  const d = parts.days ?? 0
  const h = parts.hours ?? 0
  const m = parts.minutes ?? 0
  const s = parts.seconds ?? 0
  return (
    y * SECONDS_PER_YEAR +
    mo * SECONDS_PER_MONTH +
    d * SECONDS_PER_DAY +
    h * SECONDS_PER_HOUR +
    m * SECONDS_PER_MINUTE +
    s
  )
}

/**
 * Decompose total seconds into segment digit strings for the given fields (largest units first).
 */
export function totalSecondsToSegmentDigits(
  totalSeconds: number,
  fields: Extract<FormatToken, { type: "field" }>[],
): string[] {
  let r = Math.max(0, Math.floor(totalSeconds))
  const kinds = fields.map((f) => f.kind)

  const hasY = kinds.includes("year")
  const hasMo = kinds.includes("month")
  const hasD = kinds.includes("day")
  const hasH = kinds.includes("hour")
  const hasMi = kinds.includes("minute")
  const hasS = kinds.includes("second")

  const out: Record<FieldKind, number> = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  }

  if (hasY) {
    out.year = Math.floor(r / SECONDS_PER_YEAR)
    r %= SECONDS_PER_YEAR
  }
  if (hasMo) {
    out.month = Math.floor(r / SECONDS_PER_MONTH)
    r %= SECONDS_PER_MONTH
  }
  if (hasD) {
    out.day = Math.floor(r / SECONDS_PER_DAY)
    r %= SECONDS_PER_DAY
  }
  if (hasH) {
    out.hour = Math.floor(r / SECONDS_PER_HOUR)
    r %= SECONDS_PER_HOUR
  }
  if (hasMi) {
    out.minute = Math.floor(r / SECONDS_PER_MINUTE)
    r %= SECONDS_PER_MINUTE
  }
  if (hasS) {
    out.second = r
  }

  return fields.map((f) => {
    const n = out[f.kind]
    return String(n)
  })
}

export function formatSegmentDisplay(raw: string, minWidth: number): string {
  if (raw === "") {
    return "0".repeat(minWidth)
  }
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n)) return "0".repeat(minWidth)
  const s = String(n)
  if (s.length < minWidth) return s.padStart(minWidth, "0")
  return s
}

export function appendDigitRtl(currentRaw: string, digit: string, replaceFirst: boolean): string {
  if (!/^\d$/.test(digit)) return currentRaw
  const d = parseInt(digit, 10)
  if (replaceFirst || currentRaw === "") {
    return String(d)
  }
  const prev = parseInt(currentRaw, 10)
  if (!Number.isFinite(prev)) return String(d)
  const next = prev * 10 + d
  return String(next)
}

export function backspaceDigitRtl(currentRaw: string): string {
  if (currentRaw.length <= 1) return ""
  const n = Math.floor(parseInt(currentRaw, 10) / 10)
  return String(n)
}

export { fieldTokens, type FormatToken } from "./datetime-format"
