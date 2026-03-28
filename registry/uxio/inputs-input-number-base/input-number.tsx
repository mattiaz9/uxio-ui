"use client"

import * as React from "react"

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/registry/uxio/overrides-input-base/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/registry/uxio/overrides-input-group-base/input-group"

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function sanitizeBounds(min?: number, max?: number) {
  const safeMin = isFiniteNumber(min) ? min : undefined
  const safeMax = isFiniteNumber(max) ? max : undefined

  if (safeMin !== undefined && safeMax !== undefined && safeMin > safeMax) {
    return { min: undefined, max: undefined }
  }

  return { min: safeMin, max: safeMax }
}

function sanitizeInput(raw: string): string {
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

function parseCommittedValue(value: string): number | null {
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

function countFractionDigits(value: string): number {
  const normalized = value.replace(",", ".")
  const [, fraction = ""] = normalized.split(".")
  return fraction.length
}

function clampNumber(value: number, min?: number, max?: number): number {
  let next = value
  if (min !== undefined) next = Math.max(min, next)
  if (max !== undefined) next = Math.min(max, next)
  return next
}

function formatNumber(value: number, separator: "." | ",", precision: number): string {
  const fixed = precision > 0 ? value.toFixed(precision) : String(Math.trunc(value))
  const normalized = precision > 0 ? fixed.replace(/\.?0+$/, "") : fixed
  return separator === "," ? normalized.replace(".", ",") : normalized
}

function getPreferredSeparator(value: string, fallback: "." | ","): "." | "," {
  if (value.includes(",")) return ","
  if (value.includes(".")) return "."
  return fallback
}

function coerceInitialDisplay(value: string | number | undefined, separator: "." | ","): string {
  if (typeof value === "string") return sanitizeInput(value)
  if (!isFiniteNumber(value)) return ""
  return formatNumber(value, separator, countFractionDigits(String(value)))
}

type InputNumberProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: string | number
  defaultValue?: string | number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    className,
    value,
    defaultValue,
    onChange,
    onValueChange,
    onBlur,
    onKeyDown,
    onPaste,
    onWheel,
    disabled,
    readOnly,
    min,
    max,
    step = 1,
    ...props
  },
  ref,
) {
  const isStringControlled = typeof value === "string"
  const isNumberControlled = isFiniteNumber(value)
  const safeStep = isFiniteNumber(step) && step > 0 ? step : 1
  const bounds = sanitizeBounds(min, max)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [preferredSeparator, setPreferredSeparator] = React.useState<"." | ",">(() =>
    typeof defaultValue === "string" ? getPreferredSeparator(defaultValue, ".") : ".",
  )
  const [uncontrolledDisplay, setUncontrolledDisplay] = React.useState(() =>
    coerceInitialDisplay(defaultValue, preferredSeparator),
  )
  const [numberDraft, setNumberDraft] = React.useState<string | null>(null)
  const lastCommittedValueRef = React.useRef<number | null | undefined>(undefined)
  const lastValidSteppedValueRef = React.useRef<number | null>(null)

  const stringControlledValue = isStringControlled ? sanitizeInput(value) : ""
  const numberControlledValue = isNumberControlled
    ? formatNumber(
        clampNumber(value, bounds.min, bounds.max),
        preferredSeparator,
        countFractionDigits(String(value)),
      )
    : ""

  const displayValue = isStringControlled
    ? stringControlledValue
    : isNumberControlled
      ? (numberDraft ?? numberControlledValue)
      : uncontrolledDisplay

  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  React.useEffect(() => {
    if (!isNumberControlled) return
    setNumberDraft(null)
  }, [isNumberControlled, value])

  React.useEffect(() => {
    const parsed = parseCommittedValue(displayValue)
    if (parsed !== null) {
      lastValidSteppedValueRef.current = clampNumber(parsed, bounds.min, bounds.max)
    }
  }, [bounds.max, bounds.min, displayValue])

  const emitChange = React.useCallback(
    (nextValue: string, source?: HTMLInputElement | null) => {
      const target = source ?? inputRef.current
      if (!target) return
      const eventTarget = Object.create(target) as HTMLInputElement
      Object.defineProperty(eventTarget, "value", {
        value: nextValue,
        configurable: true,
      })
      onChange?.({
        target: eventTarget,
        currentTarget: eventTarget,
      } as React.ChangeEvent<HTMLInputElement>)
    },
    [onChange],
  )

  const updateLocalDisplay = React.useCallback(
    (nextValue: string) => {
      if (isStringControlled) return
      if (isNumberControlled) {
        setNumberDraft(nextValue)
        return
      }
      setUncontrolledDisplay(nextValue)
    },
    [isNumberControlled, isStringControlled],
  )

  const emitValueChange = React.useCallback(
    (nextValue: number | null) => {
      if (
        lastCommittedValueRef.current !== undefined &&
        Object.is(lastCommittedValueRef.current, nextValue)
      ) {
        return
      }
      lastCommittedValueRef.current = nextValue
      onValueChange?.(nextValue)
    },
    [onValueChange],
  )

  const commitDisplayValue = React.useCallback(
    (rawValue: string, source?: HTMLInputElement | null) => {
      const sanitized = sanitizeInput(rawValue)
      const separator = getPreferredSeparator(sanitized, preferredSeparator)
      setPreferredSeparator(separator)

      const parsed = parseCommittedValue(sanitized)
      if (parsed === null) {
        updateLocalDisplay(sanitized)
        emitChange(sanitized, source)
        emitValueChange(null)
        return
      }

      const clamped = clampNumber(parsed, bounds.min, bounds.max)
      lastValidSteppedValueRef.current = clamped
      const precision = Math.max(
        countFractionDigits(sanitized),
        countFractionDigits(String(safeStep)),
      )
      const nextDisplay = formatNumber(clamped, separator, precision)

      updateLocalDisplay(nextDisplay)
      emitChange(nextDisplay, source)
      emitValueChange(clamped)
    },
    [
      bounds.max,
      bounds.min,
      emitChange,
      emitValueChange,
      preferredSeparator,
      safeStep,
      updateLocalDisplay,
    ],
  )

  const stepValue = React.useCallback(
    (direction: 1 | -1) => {
      if (disabled || readOnly) return

      const parsed = parseCommittedValue(displayValue)
      const base =
        parsed !== null
          ? clampNumber(parsed, bounds.min, bounds.max)
          : (lastValidSteppedValueRef.current ?? bounds.min ?? 0)

      const separator = getPreferredSeparator(displayValue, preferredSeparator)
      setPreferredSeparator(separator)
      const precision = Math.max(
        countFractionDigits(displayValue),
        countFractionDigits(String(safeStep)),
      )
      const nextNumber = clampNumber(base + direction * safeStep, bounds.min, bounds.max)
      const nextDisplay = formatNumber(nextNumber, separator, precision)

      lastValidSteppedValueRef.current = nextNumber
      updateLocalDisplay(nextDisplay)
      emitChange(nextDisplay, inputRef.current)
      emitValueChange(nextNumber)
    },
    [
      bounds.max,
      bounds.min,
      disabled,
      displayValue,
      emitChange,
      emitValueChange,
      preferredSeparator,
      readOnly,
      safeStep,
      updateLocalDisplay,
    ],
  )

  return (
    <InputGroup className="cn-input-number">
      <Input
        {...props}
        ref={setRefs}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        readOnly={readOnly}
        data-slot="input-group-control"
        className={cn("cn-input-group-input flex-1", className)}
        value={displayValue}
        onChange={(event) => {
          const sanitized = sanitizeInput(event.currentTarget.value)
          setPreferredSeparator(getPreferredSeparator(sanitized, preferredSeparator))
          updateLocalDisplay(sanitized)
          emitChange(sanitized, event.currentTarget)
        }}
        onBlur={(event) => {
          onBlur?.(event)
          if (event.defaultPrevented || disabled) return
          commitDisplayValue(event.currentTarget.value, event.currentTarget)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || disabled) return

          if (event.key === "Enter") {
            event.preventDefault()
            commitDisplayValue(event.currentTarget.value, event.currentTarget)
            return
          }

          if (event.key === "ArrowUp") {
            event.preventDefault()
            stepValue(1)
            return
          }

          if (event.key === "ArrowDown") {
            event.preventDefault()
            stepValue(-1)
          }
        }}
        onPaste={(event) => {
          onPaste?.(event)
          if (event.defaultPrevented || disabled || readOnly) return

          event.preventDefault()
          const pasted = event.clipboardData.getData("text")
          const input = event.currentTarget
          const selectionStart = input.selectionStart ?? input.value.length
          const selectionEnd = input.selectionEnd ?? input.value.length
          const nextRaw =
            input.value.slice(0, selectionStart) + pasted + input.value.slice(selectionEnd)
          const sanitized = sanitizeInput(nextRaw)

          setPreferredSeparator(getPreferredSeparator(sanitized, preferredSeparator))
          updateLocalDisplay(sanitized)
          emitChange(sanitized, input)
        }}
        onWheel={(event) => {
          onWheel?.(event)
          event.preventDefault()
        }}
      />
      <InputGroupAddon
        align="inline-end"
        className="flex h-full flex-col gap-px p-0 pr-1.5 text-muted-foreground"
      >
        <InputGroupButton
          type="button"
          className="h-[calc((100%-2px)/2)] focus-visible:ring-1"
          size="xs"
          variant="secondary"
          disabled={disabled || readOnly}
          aria-label="Increase value"
          onClick={() => {
            stepValue(1)
          }}
        >
          <ChevronUpIcon className="h-[calc(100%-2px)]" />
        </InputGroupButton>
        <InputGroupButton
          type="button"
          className="h-[calc((100%-2px)/2)] focus-visible:ring-1"
          size="xs"
          variant="secondary"
          disabled={disabled || readOnly}
          aria-label="Decrease value"
          onClick={() => {
            stepValue(-1)
          }}
        >
          <ChevronDownIcon className="h-[calc(100%-2px)]" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
})

export { InputNumber }
