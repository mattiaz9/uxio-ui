import { isValid } from "date-fns"

export type InputDatetimeMode = "date" | "time" | "datetime"

export type FieldKind = "year" | "month" | "day" | "hour" | "minute" | "second"

export type FormatToken =
  | { type: "literal"; text: string }
  | { type: "field"; kind: FieldKind; pattern: string }

export const ALLOWED_FIELDS = {
  date: ["year", "month", "day"],
  time: ["hour", "minute", "second"],
  datetime: ["year", "month", "day", "hour", "minute", "second"],
} as const satisfies Record<InputDatetimeMode, readonly FieldKind[]>

export const DEFAULT_FORMAT = {
  date: "yyyy/MM/dd",
  time: "HH:mm",
  datetime: "yyyy/MM/dd HH:mm",
} as const

export function fieldCharToKind(c: string): FieldKind {
  switch (c) {
    case "y":
      return "year"
    case "M":
      return "month"
    case "d":
      return "day"
    case "H":
      return "hour"
    case "m":
      return "minute"
    case "s":
      return "second"
    default:
      return "year"
  }
}

export function tokenizeFormat(fmt: string): FormatToken[] {
  const tokens: FormatToken[] = []
  let i = 0
  while (i < fmt.length) {
    const c = fmt.charAt(i)
    if ("yMdHms".includes(c)) {
      let j = i + 1
      while (j < fmt.length && fmt.charAt(j) === c) j++
      const pattern = fmt.slice(i, j)
      tokens.push({ type: "field", kind: fieldCharToKind(c), pattern })
      i = j
    } else {
      let j = i + 1
      while (j < fmt.length && !"yMdHms".includes(fmt.charAt(j))) j++
      tokens.push({ type: "literal", text: fmt.slice(i, j) })
      i = j
    }
  }
  return tokens
}

export function tokensForMode(tokens: FormatToken[], mode: InputDatetimeMode): FormatToken[] {
  const allow = new Set(ALLOWED_FIELDS[mode])
  const filtered = tokens.filter((t) => t.type === "literal" || allow.has(t.kind))
  const merged: FormatToken[] = []
  for (const t of filtered) {
    const last = merged[merged.length - 1]
    if (t.type === "literal" && last?.type === "literal") {
      merged[merged.length - 1] = { type: "literal", text: last.text + t.text }
    } else {
      merged.push(t)
    }
  }
  while (merged.length > 0) {
    const first = merged[0]
    if (first?.type !== "literal") break
    merged.shift()
  }
  while (merged.length > 0) {
    const last = merged[merged.length - 1]
    if (last?.type !== "literal") break
    merged.pop()
  }
  return merged
}

export function fieldTokens(tokens: FormatToken[]): Extract<FormatToken, { type: "field" }>[] {
  return tokens.filter((t): t is Extract<FormatToken, { type: "field" }> => t.type === "field")
}

export function composeString(tokens: FormatToken[], segments: string[]): string {
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

export function parseSegmentsFromString(str: string, tokens: FormatToken[]): string[] {
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
      const max = t.pattern.length
      let buf = ""
      while (pos < str.length && buf.length < max) {
        const ch = str.charAt(pos)
        if (!/\d/.test(ch)) break
        buf += ch
        pos++
      }
      segments[idx] = buf
    }
  }
  return segments
}

export function segmentsComplete(tokens: FormatToken[], segments: string[]): boolean {
  const fields = fieldTokens(tokens)
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    if (!f) return false
    const s = segments[i] ?? ""
    if (s.length !== f.pattern.length) return false
  }
  return fields.length > 0
}

export function coerceToDate(value: string | Date | null | undefined): Date | null {
  const d = new Date(value ?? "")
  return isValid(d) ? d : null
}
