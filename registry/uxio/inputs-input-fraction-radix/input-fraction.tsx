"use client"

import * as React from "react"

import {
  clampFractionStringsForDisplay,
  compactFractionValue,
  fractionSegmentsComplete,
  fractionTokens,
  fieldTokens,
  hasFractionBounds,
  normalizeCommittedFraction,
  normalizeCommittedFractionWithBounds,
  parseSegmentsFromFractionString,
  type FractionBounds,
} from "@/registry/lib/fraction-format"
import { cnInputGroupCustomControl } from "@/registry/lib/input-group-custom-control"
import { InputGroup } from "@/registry/uxio/overrides-input-group-radix/input-group"

interface InputFractionProps
  extends
    Omit<
      React.ComponentProps<"input">,
      "type" | "value" | "defaultValue" | "onChange" | "readOnly" | "size"
    >,
    Pick<React.ComponentProps<typeof InputGroup>, "size"> {
  /** Max digits per segment (numerator and denominator). Defaults to `6`. */
  maxDigits?: number
  /** Inclusive lower bound for the numerator integer (after digit parsing). */
  minNumerator?: number
  /** Inclusive upper bound for the numerator. */
  maxNumerator?: number
  /**
   * Inclusive lower bound for the denominator. When omitted, the minimum is `1` (same as unbounded
   * validation).
   */
  minDenominator?: number
  /** Inclusive upper bound for the denominator. */
  maxDenominator?: number
  /** Compact fraction string, e.g. `2/5`. Controlled when set. */
  value?: string | null
  defaultValue?: string | null
  /**
   * Fires when the value is committed (blur, Enter) with a normalized fraction, or `null` when
   * both segments are cleared.
   */
  onValueChange?: (value: string | null) => void
  /** Fires with the compact `n/d` string whenever segments change (including partial input). */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

function InputFraction({
  className,
  ref,
  maxDigits = 6,
  minNumerator,
  maxNumerator,
  minDenominator,
  maxDenominator,
  value: valueProp,
  defaultValue,
  onValueChange,
  onChange,
  name,
  disabled,
  size,
  ...inputProps
}: InputFractionProps) {
  const fractionBounds = React.useMemo((): FractionBounds | undefined => {
    const b: FractionBounds = {
      minNumerator,
      maxNumerator,
      minDenominator,
      maxDenominator,
    }
    return hasFractionBounds(b) ? b : undefined
  }, [minNumerator, maxNumerator, minDenominator, maxDenominator])

  const tokens = React.useMemo(() => fractionTokens(maxDigits), [maxDigits])
  const fields = React.useMemo(() => fieldTokens(tokens), [tokens])
  const fieldIndexAtToken = React.useMemo(() => {
    let fi = 0
    return tokens.map((t) => {
      if (t.type === "literal") return -1
      const i = fi
      fi += 1
      return i
    })
  }, [tokens])

  const [segments, setSegments] = React.useState<string[]>(() => {
    const flds = fieldTokens(fractionTokens(maxDigits))
    const init = valueProp !== undefined ? valueProp : (defaultValue ?? undefined)
    if (init !== undefined && init !== null && init !== "") {
      const [n, d] = parseSegmentsFromFractionString(String(init), maxDigits)
      const [n2, d2] = clampFractionStringsForDisplay(n, d, fractionBounds, maxDigits)
      return [n2, d2]
    }
    return flds.map(() => "")
  })

  const innerInputRef = React.useRef<HTMLInputElement>(null)
  const segmentRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const segmentsRef = React.useRef(segments)
  const lastComposedCommit = React.useRef<string | null>(null)
  const replaceOnNextDigitRef = React.useRef(false)

  const stringValue = React.useMemo(
    () => compactFractionValue(segments[0] ?? "", segments[1] ?? ""),
    [segments],
  )

  const isControlled = valueProp !== undefined

  React.useImperativeHandle(ref, () => innerInputRef.current as HTMLInputElement, [])

  React.useLayoutEffect(() => {
    segmentsRef.current = segments
  }, [segments])

  React.useEffect(() => {
    if (!isControlled) return
    lastComposedCommit.current = null
    if (valueProp === null || valueProp === "") {
      const empty = fieldTokens(fractionTokens(maxDigits)).map(() => "")
      segmentsRef.current = empty
      setSegments(empty)
      return
    }
    const [n, d] = parseSegmentsFromFractionString(String(valueProp), maxDigits)
    const [n2, d2] = clampFractionStringsForDisplay(n, d, fractionBounds, maxDigits)
    const next = [n2, d2]
    segmentsRef.current = next
    setSegments(next)
  }, [isControlled, valueProp, maxDigits, fractionBounds])

  const emitStringChange = React.useCallback(
    (next: string) => {
      if (!onChange) return
      const el = innerInputRef.current
      if (!el) return
      onChange({
        target: { value: next, name: name ?? "" },
        currentTarget: el,
      } as React.ChangeEvent<HTMLInputElement>)
    },
    [onChange, name],
  )

  const commitParsedValue = React.useCallback(
    (segs: string[], fromFlush = false) => {
      const empty = segs.every((s) => s === "")
      if (empty) {
        lastComposedCommit.current = null
        emitStringChange("")
        onValueChange?.(null)
        return
      }

      const rawCompact = compactFractionValue(segs[0] ?? "", segs[1] ?? "")

      if (!fractionSegmentsComplete(segs, fractionBounds, maxDigits)) {
        lastComposedCommit.current = null
        emitStringChange(rawCompact)
        return
      }

      const normalized = fractionBounds
        ? normalizeCommittedFractionWithBounds(
            segs[0] ?? "",
            segs[1] ?? "",
            fractionBounds,
            maxDigits,
          )
        : normalizeCommittedFraction(segs[0] ?? "", segs[1] ?? "")
      if (!normalized) return

      const syncClampToDisplay = () => {
        const [n, d] = parseSegmentsFromFractionString(normalized, maxDigits)
        if ((segs[0] ?? "") !== n || (segs[1] ?? "") !== d) {
          segmentsRef.current = [n, d]
          setSegments([n, d])
        }
      }

      if (lastComposedCommit.current === normalized) {
        if (fromFlush) syncClampToDisplay()
        emitStringChange(normalized)
        return
      }

      lastComposedCommit.current = normalized
      onValueChange?.(normalized)
      emitStringChange(normalized)
      if (fromFlush) syncClampToDisplay()
    },
    [onValueChange, emitStringChange, fractionBounds, maxDigits],
  )

  const pushSegments = React.useCallback(
    (next: string[]) => {
      segmentsRef.current = next
      setSegments(next)
      commitParsedValue(next, false)
    },
    [commitParsedValue],
  )

  const flushCommit = React.useCallback(() => {
    commitParsedValue(segmentsRef.current, true)
  }, [commitParsedValue])

  const updateSegment = (index: number, next: string) => {
    const copy = [...segmentsRef.current]
    copy[index] = next
    pushSegments(copy)
  }

  const focusSegment = (index: number) => {
    segmentRefs.current[index]?.focus()
  }

  return (
    <InputGroup size={size} className={className} data-slot="input-fraction">
      <input
        {...inputProps}
        type="hidden"
        data-slot="input-fraction-hidden"
        ref={innerInputRef}
        name={name}
        value={stringValue}
        disabled={disabled}
        readOnly
        aria-hidden
        tabIndex={-1}
      />
      <div
        className={cnInputGroupCustomControl(size, { disabled })}
        data-slot="input-fraction-control"
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === "Enter") {
            flushCommit()
          }
        }}
      >
        {tokens.map((t, ti) => {
          if (t.type === "literal") {
            return (
              <span key={`lit-${ti}`} className="text-muted-foreground select-none" aria-hidden>
                {t.text}
              </span>
            )
          }
          const idx = fieldIndexAtToken[ti]
          if (idx === undefined || idx < 0) return null
          const raw = segments[idx] ?? ""
          const max = t.pattern.length
          const isPlaceholder = !raw.length
          const label = t.kind === "numerator" ? "Numerator" : "Denominator"
          return (
            <span
              key={`field-${idx}-${t.kind}`}
              ref={(el) => {
                segmentRefs.current[idx] = el
              }}
              className="cn-input-segment"
              data-placeholder={isPlaceholder}
              tabIndex={disabled ? -1 : 0}
              role="textbox"
              aria-label={label}
              aria-disabled={disabled}
              onFocus={() => {
                replaceOnNextDigitRef.current = true
              }}
              onKeyDown={(e) => {
                if (disabled) return
                const cur = segments[idx] ?? ""
                if (/^\d$/.test(e.key)) {
                  e.preventDefault()
                  let next: string
                  if (replaceOnNextDigitRef.current) {
                    next = e.key
                    replaceOnNextDigitRef.current = false
                  } else if (cur.length >= max) {
                    next = e.key
                  } else {
                    next = cur + e.key
                  }
                  if (next.length > max) next = next.slice(0, max)
                  updateSegment(idx, next)
                  if (next.length >= max && idx < fields.length - 1) {
                    focusSegment(idx + 1)
                  }
                  return
                }
                if (e.key === "Backspace") {
                  e.preventDefault()
                  if (cur.length > 0) {
                    updateSegment(idx, cur.slice(0, -1))
                  } else if (idx > 0) {
                    focusSegment(idx - 1)
                  }
                  return
                }
                if (e.key === "Delete") {
                  e.preventDefault()
                  replaceOnNextDigitRef.current = true
                  updateSegment(idx, "")
                  return
                }
                if (e.key === "ArrowLeft" && idx > 0) {
                  e.preventDefault()
                  focusSegment(idx - 1)
                }
                if (e.key === "ArrowRight" && idx < fields.length - 1) {
                  e.preventDefault()
                  focusSegment(idx + 1)
                }
                if (e.key === "Enter") {
                  e.preventDefault()
                  flushCommit()
                }
              }}
              onBlur={() => {
                if (disabled) return
                const cur = segmentsRef.current
                if ((cur[idx] ?? "") === "") {
                  const copy = [...cur]
                  copy[idx] = "0"
                  segmentsRef.current = copy
                  setSegments(copy)
                }
                flushCommit()
              }}
            >
              {raw.length === 0 ? (
                <span data-empty={true}>0</span>
              ) : (
                raw.split("").map((ch, i) => <span key={i}>{ch}</span>)
              )}
            </span>
          )
        })}
      </div>
    </InputGroup>
  )
}

export { InputFraction }
