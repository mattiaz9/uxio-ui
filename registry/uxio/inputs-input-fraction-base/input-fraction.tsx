"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  compactFractionValue,
  fractionSegmentsComplete,
  fractionTokens,
  fieldTokens,
  normalizeCommittedFraction,
  parseSegmentsFromFractionString,
  type FractionFormatToken,
} from "@/registry/lib/fraction-format"
import { InputGroup } from "@/registry/uxio/overrides-input-group-base/input-group"

interface InputFractionProps extends Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> {
  /** Max digits per segment (numerator and denominator). Defaults to `6`. */
  maxDigits?: number
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
  name?: string
  disabled?: boolean
}

function InputFraction({
  className,
  maxDigits = 6,
  value: valueProp,
  defaultValue,
  onValueChange,
  onChange,
  name,
  disabled,
  id,
  ...props
}: InputFractionProps) {
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
      return [n, d]
    }
    return flds.map(() => "")
  })
  const innerInputRef = React.useRef<HTMLInputElement>(null)
  const segmentRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const segmentsRef = React.useRef(segments)
  const lastComposedCommit = React.useRef<string | null>(null)
  const replaceOnNextDigitRef = React.useRef(false)

  React.useLayoutEffect(() => {
    segmentsRef.current = segments
  }, [segments])

  const stringValue = React.useMemo(
    () => compactFractionValue(segments[0] ?? "", segments[1] ?? ""),
    [segments],
  )

  const isControlled = valueProp !== undefined

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
    const next = [n, d]
    segmentsRef.current = next
    setSegments(next)
  }, [isControlled, valueProp, maxDigits])

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
    (segs: string[]) => {
      emitStringChange(compactFractionValue(segs[0] ?? "", segs[1] ?? ""))
      const empty = segs.every((s) => s === "")
      if (empty) {
        lastComposedCommit.current = null
        onValueChange?.(null)
        return
      }
      if (!fractionSegmentsComplete(segs)) {
        lastComposedCommit.current = null
        return
      }
      const normalized = normalizeCommittedFraction(segs[0]!, segs[1]!)
      if (!normalized) return
      if (lastComposedCommit.current === normalized) return
      lastComposedCommit.current = normalized
      onValueChange?.(normalized)
    },
    [onValueChange, emitStringChange],
  )

  const pushSegments = React.useCallback(
    (next: string[]) => {
      segmentsRef.current = next
      setSegments(next)
      commitParsedValue(next)
    },
    [commitParsedValue],
  )

  const flushCommit = React.useCallback(() => {
    commitParsedValue(segmentsRef.current)
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
    <InputGroup className={className} data-slot="input-fraction" {...props}>
      <input
        type="hidden"
        id={id}
        ref={innerInputRef}
        name={name}
        value={stringValue}
        disabled={disabled}
        readOnly
        aria-hidden
        tabIndex={-1}
      />
      <div
        className={cn(
          "cn-input-group-input flex h-full flex-1 flex-wrap items-center gap-0.5 px-3 py-1 text-sm",
          disabled && "pointer-events-none opacity-50",
        )}
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
          const f = t as Extract<FractionFormatToken, { type: "field" }>
          const raw = segments[idx] ?? ""
          const max = f.pattern.length
          const label = f.kind === "numerator" ? "Numerator" : "Denominator"
          return (
            <span
              key={`field-${idx}-${f.kind}`}
              ref={(el) => {
                segmentRefs.current[idx] = el
              }}
              className={cn(
                "min-w-[1ch] rounded-xs px-0.5 font-mono tabular-nums outline-none focus:bg-accent focus:text-accent-foreground",
                !raw.length && "text-muted-foreground",
              )}
              tabIndex={disabled ? -1 : 0}
              role="textbox"
              aria-label={label}
              aria-disabled={disabled}
              data-placeholder="0"
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
              onBlur={() => flushCommit()}
            >
              {raw.length === 0 ? (
                <span className="text-muted-foreground/40">0</span>
              ) : (
                raw.split("").map((ch, i) => (
                  <span key={i}>{ch}</span>
                ))
              )}
            </span>
          )
        })}
      </div>
    </InputGroup>
  )
}

export { InputFraction }
