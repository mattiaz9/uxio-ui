import { describe, expect, test } from "vitest"

import {
  compactFractionValue,
  composeFractionDisplay,
  fractionSegmentsComplete,
  fractionTokens,
  fieldTokens,
  normalizeCommittedFraction,
  parseSegmentsFromFractionString,
} from "@/registry/lib/fraction-format"

describe("fraction-format", () => {
  test("tokens are numerator, literal, denominator", () => {
    const tokens = fractionTokens(4)
    expect(tokens.map((t) => (t.type === "literal" ? t.text : t.kind))).toEqual([
      "numerator",
      " / ",
      "denominator",
    ])
    expect(fieldTokens(tokens).map((f) => f.pattern.length)).toEqual([4, 4])
  })

  test("compose display joins segments with spaced slash", () => {
    const tokens = fractionTokens(6)
    const display = composeFractionDisplay(tokens, ["2", "5"])
    expect(display).toBe("2 / 5")
  })

  test("compact value has no spaces", () => {
    expect(compactFractionValue("2", "5")).toBe("2/5")
    expect(compactFractionValue("", "")).toBe("")
  })

  test("parse accepts spaced or compact strings", () => {
    expect(parseSegmentsFromFractionString("2/5", 6)).toEqual(["2", "5"])
    expect(parseSegmentsFromFractionString("2 / 5", 6)).toEqual(["2", "5"])
    expect(parseSegmentsFromFractionString("  12  /  99 ", 6)).toEqual(["12", "99"])
  })

  test("normalize rejects denominator zero", () => {
    expect(normalizeCommittedFraction("1", "0")).toBeNull()
    expect(normalizeCommittedFraction("3", "4")).toBe("3/4")
  })

  test("fractionSegmentsComplete mirrors normalize", () => {
    expect(fractionSegmentsComplete(["2", "5"])).toBe(true)
    expect(fractionSegmentsComplete(["1", "0"])).toBe(false)
    expect(fractionSegmentsComplete(["", "5"])).toBe(false)
  })
})
