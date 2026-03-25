"use client"

import * as React from "react"
import { format, isValid, parse, set } from "date-fns"

import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
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

type InputDatetimeMode = "date" | "time" | "datetime"

type FieldKind = "year" | "month" | "day" | "hour" | "minute" | "second"

type FormatToken =
  | { type: "literal"; text: string }
  | { type: "field"; kind: FieldKind; pattern: string }

const DATE_FIELDS: ReadonlySet<FieldKind> = new Set(["year", "month", "day"])
const TIME_FIELDS: ReadonlySet<FieldKind> = new Set(["hour", "minute", "second"])

function fieldCharToKind(c: string): FieldKind {
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

function tokenizeFormat(fmt: string): FormatToken[] {
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

function allowedFields(mode: InputDatetimeMode): ReadonlySet<FieldKind> {
  if (mode === "date") return DATE_FIELDS
  if (mode === "time") return TIME_FIELDS
  return new Set([...DATE_FIELDS, ...TIME_FIELDS])
}

function tokensForMode(tokens: FormatToken[], mode: InputDatetimeMode): FormatToken[] {
  const allow = allowedFields(mode)
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

function fieldTokens(tokens: FormatToken[]): Extract<FormatToken, { type: "field" }>[] {
  return tokens.filter((t): t is Extract<FormatToken, { type: "field" }> => t.type === "field")
}

function composeString(tokens: FormatToken[], segments: string[]): string {
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

function parseSegmentsFromString(str: string, tokens: FormatToken[]): string[] {
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

function defaultFormatForMode(mode: InputDatetimeMode, dateSeparator: string): string {
  const s = dateSeparator
  if (mode === "date") return `yyyy${s}MM${s}dd`
  if (mode === "time") return "HH:mm"
  return `yyyy${s}MM${s}dd HH:mm`
}

function segmentsComplete(tokens: FormatToken[], segments: string[]): boolean {
  const fields = fieldTokens(tokens)
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    if (!f) return false
    const s = segments[i] ?? ""
    if (s.length !== f.pattern.length) return false
  }
  return fields.length > 0
}

function coerceToDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === "") return null
  if (value instanceof Date) return isValid(value) ? value : null
  const d = new Date(value)
  return isValid(d) ? d : null
}

export type InputDatetimeProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  mode?: InputDatetimeMode
  /** date-fns format string; fields should match `mode` (date / time / datetime). */
  format?: string
  /**
   * Separator between year, month, and day in the default format (when `format` is omitted).
   * Ignored if you pass an explicit `format`. Do not use characters that conflict with date-fns
   * pattern letters (`y`, `M`, `d`, `H`, `m`, `s`).
   */
  separator?: string
  value?: Date | string | null
  defaultValue?: Date | string | null
  /** Called when the value is committed: all segments filled, Enter, or calendar selection. */
  onValueChange?: (date: Date | null) => void
  /** Fires with the composed string whenever segments change (including partial input). */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  name?: string
  disabled?: boolean
}

const InputDatetime = React.forwardRef<HTMLInputElement, InputDatetimeProps>(function InputDatetime(
  {
    className,
    mode = "datetime",
    format: formatProp,
    separator: separatorProp = "/",
    value: valueProp,
    defaultValue,
    onValueChange,
    onChange,
    name,
    disabled,
    id,
    ...props
  },
  ref,
) {
  const formatStr = React.useMemo(() => {
    if (formatProp) return formatProp
    return defaultFormatForMode(mode, separatorProp)
  }, [formatProp, mode, separatorProp])
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

  const [segments, setSegments] = React.useState<string[]>(() => {
    const initial = coerceToDate(valueProp !== undefined ? valueProp : (defaultValue ?? undefined))
    const fmt = formatProp ?? defaultFormatForMode(mode, separatorProp)
    const tok = tokensForMode(tokenizeFormat(fmt), mode)
    const flds = fieldTokens(tok)
    if (initial && flds.length) {
      return parseSegmentsFromString(format(initial, fmt), tok)
    }
    return flds.map(() => "")
  })
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const innerInputRef = React.useRef<HTMLInputElement>(null)
  const segmentRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const segmentsRef = React.useRef(segments)
  const lastComposedCommit = React.useRef<string | null>(null)
  /** After focus, first digit replaces the segment; further digits append (avoids selection/DOM quirks). */
  const replaceOnNextDigitRef = React.useRef(false)

  React.useLayoutEffect(() => {
    segmentsRef.current = segments
  }, [segments])

  React.useImperativeHandle(ref, () => innerInputRef.current as HTMLInputElement, [])

  const stringValue = React.useMemo(() => composeString(tokens, segments), [tokens, segments])

  const isControlled = valueProp !== undefined

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

  const parsedForCalendar = React.useMemo(() => {
    if (!segmentsComplete(tokens, segments)) return null
    const refDate = new Date()
    const p = parse(stringValue, formatStr, refDate)
    return isValid(p) ? p : null
  }, [tokens, segments, stringValue, formatStr])

  const calendarSelected = React.useMemo(() => {
    if (parsedForCalendar) return parsedForCalendar
    const d = coerceToDate(valueProp !== undefined ? valueProp : (defaultValue ?? undefined))
    return d ?? undefined
  }, [parsedForCalendar, valueProp, defaultValue])

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
    <InputGroup className={cn("cn-input-datetime", className)} {...props}>
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
        data-slot="input-group-control"
        className={cn(
          "cn-input-datetime-segments cn-input-group-input flex min-h-9 flex-1 flex-wrap items-center gap-0.5 px-3 py-1 text-sm outline-none",
          disabled && "pointer-events-none opacity-50",
        )}
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
          const label =
            f.kind === "year"
              ? "Year"
              : f.kind === "month"
                ? "Month"
                : f.kind === "day"
                  ? "Day"
                  : f.kind === "hour"
                    ? "Hour"
                    : f.kind === "minute"
                      ? "Minute"
                      : "Second"
          return (
            <span
              key={`field-${idx}-${f.pattern}`}
              ref={(el) => {
                segmentRefs.current[idx] = el
              }}
              tabIndex={disabled ? -1 : 0}
              role="textbox"
              aria-label={label}
              aria-disabled={disabled}
              data-placeholder={f.pattern.replace(/./g, "0")}
              className={cn(
                "min-w-[1ch] rounded-xs px-0.5 font-mono tabular-nums outline-none focus:bg-accent focus:text-accent-foreground",
                !(segments[idx]?.length === f.pattern.length) && "text-muted-foreground",
              )}
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
              <CalendarIcon className="size-4" />
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
})

export { InputDatetime }
