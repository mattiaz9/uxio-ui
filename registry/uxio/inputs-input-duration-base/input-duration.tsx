"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  appendDigitRtl,
  backspaceDigitRtl,
  formatSegmentDisplay,
  getFieldMinWidth,
  normalizeDurationDigitMaps,
  tokenizeDurationFormat,
  totalSecondsFromParts,
  totalSecondsToSegmentDigits,
  durationPartsFromDigitMap,
  fieldTokens,
} from "@/registry/lib/duration-format"
import { InputGroup } from "@/registry/uxio/overrides-input-group-base/input-group"

interface InputDurationProps extends Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "readOnly"
> {
  /**
   * Pattern: runs of `y`, `M`, `d`, `H`, `m`, or `s` set minimum display width (leading zeros).
   * Segments accept unbounded digits. Use `'quotes'` for literal text (e.g. `HH'h'`).
   */
  format?: string
  /** Total duration in seconds, or `null` for empty. */
  value?: number | null
  defaultValue?: number | null
  /** Fires after a segment blurs or Enter with normalized carry; `null` when all segments are empty. */
  onValueChange?: (seconds: number | null) => void
  /** Fires when the committed seconds value changes (same moments as `onValueChange`). */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

function InputDuration({
  className,
  ref,
  format: formatStr = "HH'h' mm'm' ss's'",
  value: valueProp,
  defaultValue,
  onValueChange,
  onChange,
  name,
  disabled,
  ...inputProps
}: InputDurationProps) {
  const tokens = React.useMemo(() => tokenizeDurationFormat(formatStr), [formatStr])
  const fieldCount = React.useMemo(() => fieldTokens(tokens).length, [tokens])
  const fieldIndexAtToken = React.useMemo(() => {
    let fi = 0
    return tokens.map((t) => {
      if (t.type === "literal") return -1
      const i = fi
      fi += 1
      return i
    })
  }, [tokens])

  const isControlled = valueProp !== undefined

  const [committedSeconds, setCommittedSeconds] = React.useState<number | null>(() =>
    isControlled ? null : (defaultValue ?? null),
  )

  const [segments, setSegments] = React.useState<string[]>(() => {
    const flds = fieldTokens(tokens)
    const initSec = isControlled ? valueProp : (defaultValue ?? null)
    if (initSec !== null && initSec !== undefined && flds.length) {
      return totalSecondsToSegmentDigits(initSec, flds)
    }
    return flds.map(() => "")
  })

  const lastEmittedSeconds = React.useRef<number | null | undefined>(undefined)
  const innerInputRef = React.useRef<HTMLInputElement>(null)
  const segmentRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const segmentsRef = React.useRef(segments)
  const replaceOnNextDigitRef = React.useRef(false)

  React.useImperativeHandle(ref, () => innerInputRef.current as HTMLInputElement, [])

  React.useLayoutEffect(() => {
    segmentsRef.current = segments
  }, [segments])

  React.useEffect(() => {
    if (!isControlled) return
    lastEmittedSeconds.current = undefined
    const flds = fieldTokens(tokens)
    if (valueProp === null || valueProp === undefined) {
      const empty = flds.map(() => "")
      segmentsRef.current = empty
      setSegments(empty)
      return
    }
    const next = totalSecondsToSegmentDigits(valueProp, flds)
    segmentsRef.current = next
    setSegments(next)
  }, [isControlled, valueProp, tokens])

  const emitSeconds = React.useCallback(
    (seconds: number | null) => {
      if (lastEmittedSeconds.current === seconds) return
      lastEmittedSeconds.current = seconds
      if (!isControlled) {
        setCommittedSeconds(seconds)
      }
      if (onChange) {
        const el = innerInputRef.current
        if (!el) return
        onChange({
          target: { value: seconds === null ? "" : String(seconds), name: name ?? "" },
          currentTarget: el,
        } as React.ChangeEvent<HTMLInputElement>)
      }
      onValueChange?.(seconds)
    },
    [isControlled, onChange, onValueChange, name],
  )

  const commitNormalized = React.useCallback(
    (segs: string[]) => {
      const flds = fieldTokens(tokens)
      const empty = segs.every((s) => s === "")
      if (empty) {
        const emptySegments = flds.map(() => "")
        segmentsRef.current = emptySegments
        setSegments(emptySegments)
        emitSeconds(null)
        return
      }

      const normalized = normalizeDurationDigitMaps(flds, segs)
      segmentsRef.current = normalized
      setSegments(normalized)

      const parts = durationPartsFromDigitMap(flds, normalized)
      const total = totalSecondsFromParts(parts)
      emitSeconds(total)
    },
    [tokens, emitSeconds],
  )

  const flushCommit = React.useCallback(() => {
    commitNormalized(segmentsRef.current)
  }, [commitNormalized])

  const updateSegment = (index: number, next: string) => {
    const copy = [...segmentsRef.current]
    copy[index] = next
    segmentsRef.current = copy
    setSegments(copy)
  }

  const focusSegment = (index: number) => {
    segmentRefs.current[index]?.focus()
  }

  const displayHiddenSeconds = isControlled ? (valueProp ?? null) : committedSeconds
  const hiddenValue =
    displayHiddenSeconds === null || displayHiddenSeconds === undefined
      ? ""
      : String(displayHiddenSeconds)

  return (
    <InputGroup className={className} data-slot="input-duration">
      <input
        {...inputProps}
        type="hidden"
        data-slot="input-duration-hidden"
        ref={innerInputRef}
        name={name}
        value={hiddenValue}
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
        data-slot="input-duration-control"
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
          const f = t
          const raw = segments[idx] ?? ""
          const minW = getFieldMinWidth(f)
          const display = formatSegmentDisplay(raw, minW)
          const isPlaceholder = raw === ""
          const label = (() => {
            switch (f.kind) {
              case "year":
                return "Years"
              case "month":
                return "Months"
              case "day":
                return "Days"
              case "hour":
                return "Hours"
              case "minute":
                return "Minutes"
              case "second":
                return "Seconds"
            }
          })()
          return (
            <span
              key={`field-${idx}-${f.pattern}`}
              ref={(el) => {
                segmentRefs.current[idx] = el
              }}
              className={cn(
                "min-w-[1ch] rounded-xs px-0.5 font-mono tabular-nums outline-none focus:bg-accent focus:text-accent-foreground",
                isPlaceholder && "text-muted-foreground",
              )}
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
                  const next = appendDigitRtl(cur, e.key, replaceOnNextDigitRef.current)
                  replaceOnNextDigitRef.current = false
                  updateSegment(idx, next)
                  return
                }
                if (e.key === "Backspace") {
                  e.preventDefault()
                  if (cur.length > 0) {
                    updateSegment(idx, backspaceDigitRtl(cur))
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
                if (e.key === "ArrowRight" && idx < fieldCount - 1) {
                  e.preventDefault()
                  focusSegment(idx + 1)
                }
                if (e.key === "Enter") {
                  e.preventDefault()
                  flushCommit()
                }
              }}
              onBlur={() => commitNormalized(segmentsRef.current)}
            >
              {display.split("").map((ch, i) => (
                <span
                  key={`${idx}-${i}`}
                  className={cn(isPlaceholder && "text-muted-foreground/40")}
                >
                  {ch}
                </span>
              ))}
            </span>
          )
        })}
      </div>
    </InputGroup>
  )
}

export { InputDuration }
