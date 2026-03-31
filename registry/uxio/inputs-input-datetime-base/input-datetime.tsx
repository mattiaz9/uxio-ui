"use client"

import * as React from "react"
import { format, isValid, parse, set } from "date-fns"

import { cn } from "@/lib/utils"
import {
  composeString,
  coerceToDate,
  DEFAULT_FORMAT,
  fieldTokens,
  type InputDatetimeMode,
  parseSegmentsFromString,
  segmentsComplete,
  tokenizeFormat,
  tokensForMode,
} from "@/registry/lib/datetime-format"
import { cnInputGroupCustomControl } from "@/registry/lib/input-group-custom-control"
import { Calendar } from "@/registry/uxio/overrides-calendar-base/calendar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/registry/uxio/overrides-input-group-base/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/uxio/overrides-popover-base/popover"
import { IconPlaceholder } from "@/registry/uxio/shared/icon-placeholder/icon-placeholder"

interface InputDatetimeProps extends Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "readOnly" | "size"
>,
  Pick<React.ComponentProps<typeof InputGroup>, "size"> {
  mode?: InputDatetimeMode
  /**
   * Pattern string: runs of `y`, `M`, `d`, `H`, `m`, or `s` are editable segments (same rules as
   * [date-fns format](https://date-fns.org/docs/format) for those letters). Any other characters
   * are static labels between segments (e.g. `"yyyy/MM/dd - HH:mm"`). If omitted, defaults are
   * `yyyy/MM/dd` (date), `HH:mm` (time), `yyyy/MM/dd HH:mm` (datetime).
   */
  format?: string
  value?: Date | string | null
  defaultValue?: Date | string | null
  /** Called when the value is committed: all segments filled, Enter, or calendar selection. */
  onValueChange?: (date: Date | null) => void
  /** Fires with the composed string whenever segments change (including partial input). */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

function InputDatetime({
  className,
  ref,
  mode = "datetime",
  format: formatProp,
  value: valueProp,
  defaultValue,
  onValueChange,
  onChange,
  name,
  disabled,
  size,
  ...inputProps
}: InputDatetimeProps) {
  const formatStr = formatProp || DEFAULT_FORMAT[mode]

  const innerInputRef = React.useRef<HTMLInputElement>(null)
  const segmentRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const lastComposedCommit = React.useRef<string | null>(null)
  /** After focus, first digit replaces the segment; further digits append (avoids selection/DOM quirks). */
  const replaceOnNextDigitRef = React.useRef(false)

  const [segments, setSegments] = React.useState<string[]>(() => {
    const initial = coerceToDate(valueProp !== undefined ? valueProp : (defaultValue ?? undefined))
    const tok = tokensForMode(tokenizeFormat(formatStr), mode)
    const flds = fieldTokens(tok)
    if (initial && flds.length) {
      return parseSegmentsFromString(format(initial, formatStr), tok)
    }
    return flds.map(() => "")
  })
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const segmentsRef = React.useRef(segments)

  const tokens = React.useMemo(
    () => tokensForMode(tokenizeFormat(formatStr), mode),
    [formatStr, mode],
  )
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
  const stringValue = React.useMemo(() => composeString(tokens, segments), [tokens, segments])
  const parsedForCalendar = React.useMemo(() => {
    if (!segmentsComplete(tokens, segments)) return null
    const refDate = new Date()
    const p = parse(stringValue, formatStr, refDate)
    return isValid(p) ? p : null
  }, [tokens, segments, stringValue, formatStr])

  const calendarSelected = React.useMemo(() => {
    if (parsedForCalendar) return parsedForCalendar
    return coerceToDate(valueProp ?? defaultValue ?? undefined) ?? undefined
  }, [parsedForCalendar, valueProp, defaultValue])

  const isControlled = valueProp !== undefined

  React.useImperativeHandle(ref, () => innerInputRef.current as HTMLInputElement, [])

  React.useLayoutEffect(() => {
    segmentsRef.current = segments
  }, [segments])

  React.useEffect(() => {
    if (!isControlled) return
    lastComposedCommit.current = null
    if (valueProp === null || valueProp === "") {
      const empty = fieldTokens(tokens).map(() => "")
      segmentsRef.current = empty
      setSegments(empty)
      return
    }
    const d = coerceToDate(valueProp)
    if (d && fieldTokens(tokens).length) {
      const next = parseSegmentsFromString(format(d, formatStr), tokens)
      segmentsRef.current = next
      setSegments(next)
      return
    }
    if (typeof valueProp === "string") {
      const next = parseSegmentsFromString(valueProp, tokens)
      segmentsRef.current = next
      setSegments(next)
    }
  }, [isControlled, valueProp, formatStr, tokens])

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
    (composed: string, segs: string[]) => {
      emitStringChange(composed)
      if (!segmentsComplete(tokens, segs)) {
        lastComposedCommit.current = null
        return
      }
      if (lastComposedCommit.current === composed) return
      const parsed = parse(composed, formatStr, new Date())
      if (!isValid(parsed)) return
      lastComposedCommit.current = composed
      onValueChange?.(parsed)
    },
    [tokens, formatStr, onValueChange, emitStringChange],
  )

  const pushSegments = React.useCallback(
    (next: string[]) => {
      segmentsRef.current = next
      setSegments(next)
      commitParsedValue(composeString(tokens, next), next)
    },
    [tokens, commitParsedValue],
  )

  const flushCommit = React.useCallback(() => {
    const segs = segmentsRef.current
    commitParsedValue(composeString(tokens, segs), segs)
  }, [tokens, commitParsedValue])

  const updateSegment = (index: number, next: string) => {
    const copy = [...segmentsRef.current]
    copy[index] = next
    pushSegments(copy)
  }

  const focusSegment = (index: number) => {
    const el = segmentRefs.current[index]
    el?.focus()
  }

  const applyCalendarDate = (picked: Date | undefined) => {
    if (!picked) return
    const base =
      parsedForCalendar ??
      coerceToDate(valueProp !== undefined ? valueProp : (defaultValue ?? undefined)) ??
      new Date()
    let next: Date
    if (mode === "date") {
      next = set(picked, {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      })
    } else if (mode === "time") {
      next = set(base, {
        year: picked.getFullYear(),
        month: picked.getMonth(),
        date: picked.getDate(),
      })
    } else {
      next = set(base, {
        year: picked.getFullYear(),
        month: picked.getMonth(),
        date: picked.getDate(),
      })
    }
    const nextSegs = parseSegmentsFromString(format(next, formatStr), tokens)
    setPopoverOpen(false)
    lastComposedCommit.current = null
    pushSegments(nextSegs)
  }

  return (
    <InputGroup size={size} className={className} data-slot="input-datetime">
      <input
        {...inputProps}
        type="hidden"
        data-slot="input-datetime-hidden"
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
        data-slot="input-datetime-control"
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
          const max = f.pattern.length
          const label = (() => {
            switch (f.kind) {
              case "year":
                return "Year"
              case "month":
                return "Month"
              case "day":
                return "Day"
              case "hour":
                return "Hour"
              case "minute":
                return "Minute"
              case "second":
                return "Second"
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
                !(segments[idx]?.length === f.pattern.length) && "text-muted-foreground",
              )}
              tabIndex={disabled ? -1 : 0}
              role="textbox"
              aria-label={label}
              aria-disabled={disabled}
              data-placeholder={f.pattern.replace(/./g, "0")}
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
              {Array.from({ length: max }, (_, i) => {
                const ch = raw[i]
                return (
                  <span key={i} className={cn(!ch && "text-muted-foreground/40")}>
                    {ch ?? "0"}
                  </span>
                )
              })}
            </span>
          )
        })}
      </div>
      {mode !== "time" ? (
        <InputGroupAddon align="inline-end">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label="Open calendar"
                />
              }
            >
              <IconPlaceholder
                className="size-4"
                lucide="CalendarIcon"
                tabler="IconCalendar"
                hugeicons="Calendar01Icon"
                phosphor="calendar"
                remixicon="calendar"
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={calendarSelected}
                onSelect={(d) => applyCalendarDate(d)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

export { InputDatetime }
