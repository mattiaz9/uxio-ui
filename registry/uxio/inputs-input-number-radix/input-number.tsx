"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  clampNumber,
  coerceInitialDisplay,
  countFractionDigits,
  formatNumber,
  getPreferredSeparator,
  isFiniteNumber,
  parseCommittedValue,
  sanitizeBounds,
  sanitizeInput,
} from "@/registry/lib/numbers"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/registry/uxio/overrides-input-group-radix/input-group"
import { Input } from "@/registry/uxio/overrides-input-radix/input"
import { IconPlaceholder } from "@/registry/uxio/shared/icon-placeholder/icon-placeholder"

interface InputNumberProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange"
> {
  value?: string | number
  defaultValue?: string | number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
}

function InputNumber({
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
}: InputNumberProps) {
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
    <InputGroup data-slot="input-number">
      <Input
        {...props}
        ref={inputRef}
        className={cn("cn-input-group-input flex-1", className)}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        readOnly={readOnly}
        data-slot="input-number-control"
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
          <IconPlaceholder
            className="h-[calc(100%-2px)]"
            lucide="ChevronUpIcon"
            tabler="IconChevronUp"
            hugeicons="ArrowUp01Icon"
            phosphor="caret-up"
            remixicon="arrow-up-s"
          />
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
          <IconPlaceholder
            className="h-[calc(100%-2px)]"
            lucide="ChevronDownIcon"
            tabler="IconChevronDown"
            hugeicons="ArrowDown01Icon"
            phosphor="caret-down"
            remixicon="arrow-down-s"
          />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { InputNumber }
