import { describe, expect, test } from "vitest"

import {
  appendDigitRtl,
  composeDurationSegments,
  DEFAULT_DURATION_FORMAT,
  formatSegmentDisplay,
  normalizeDurationDigitMaps,
  parseVariableDurationSegments,
  tokenizeDurationFormat,
  totalSecondsFromParts,
  totalSecondsToSegmentDigits,
  fieldTokens,
} from "@/registry/lib/duration-format"

describe("duration-format", () => {
  test("default format tokenizes to hours, minutes, seconds with quoted unit literals", () => {
    const tokens = tokenizeDurationFormat(DEFAULT_DURATION_FORMAT)
    const fields = fieldTokens(tokens)
    expect(fields.map((f) => [f.kind, f.pattern])).toEqual([
      ["hour", "HH"],
      ["minute", "mm"],
      ["second", "ss"],
    ])
    const literals = tokens.filter((t) => t.type === "literal").map((t) => t.text)
    expect(literals).toEqual(["h", " ", "m", " ", "s"])
  })

  test("compose and parse variable-length segments", () => {
    const tokens = tokenizeDurationFormat("HH:mm:ss")
    const segs = ["1", "2", "3"]
    const composed = composeDurationSegments(tokens, segs)
    expect(composed).toBe("1:2:3")
    expect(parseVariableDurationSegments(composed, tokens)).toEqual(segs)
  })

  test("170 minutes carries to 2 hours and 50 minutes", () => {
    const tokens = tokenizeDurationFormat("HH:mm")
    const flds = fieldTokens(tokens)
    const normalized = normalizeDurationDigitMaps(flds, ["", "170"])
    expect(normalized).toEqual(["2", "50"])
  })

  test("appendDigitRtl builds from the right with leading-zero display", () => {
    expect(appendDigitRtl("", "1", true)).toBe("1")
    expect(formatSegmentDisplay("1", 2)).toBe("01")
    expect(appendDigitRtl("1", "2", false)).toBe("12")
    expect(formatSegmentDisplay("12", 2)).toBe("12")
  })

  test("total seconds round-trip for time-only format", () => {
    const tokens = tokenizeDurationFormat("HH:mm:ss")
    const flds = fieldTokens(tokens)
    const total = 3723 // 1h 2m 3s
    const segs = totalSecondsToSegmentDigits(total, flds)
    expect(segs).toEqual(["1", "2", "3"])
    const parts = {
      years: 0,
      months: 0,
      days: 0,
      hours: 1,
      minutes: 2,
      seconds: 3,
    }
    expect(totalSecondsFromParts(parts)).toBe(3723)
  })

  test("quoted literals can include arbitrary text between fields", () => {
    const tokens = tokenizeDurationFormat("HH'×'mm")
    const fields = fieldTokens(tokens)
    expect(fields.map((f) => f.pattern)).toEqual(["HH", "mm"])
    const lit = tokens.filter((t) => t.type === "literal")
    expect(lit.map((t) => t.text)).toEqual(["×"])
  })
})
