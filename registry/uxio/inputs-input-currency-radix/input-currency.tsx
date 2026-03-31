"use client"

import * as React from "react"

import {
  committedAmountToTypingDraft,
  computeRoundedAmount,
  getCurrencyFormatParts,
  getCurrencyFractionDigits,
  getStringControlledDisplay,
  normalizeDecimalString,
  parseCurrencyStringToNumber,
  roundToCurrencyMinorUnits,
  sanitizeCurrencyDecimalInput,
} from "@/registry/lib/currency"
import { clampNumber, isFiniteNumber, sanitizeBounds } from "@/registry/lib/numbers"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/uxio/overrides-input-group-radix/input-group"

interface InputCurrencyProps extends Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type" | "value" | "defaultValue" | "onChange" | "size"
>,
  Pick<React.ComponentProps<typeof InputGroup>, "size"> {
  currency: string
  locale?: string
  value?: string | number
  defaultValue?: string | number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onValueChange?: (value: string | null) => void
  min?: number
  max?: number
}

function InputCurrency({
  className,
  currency,
  locale,
  value,
  defaultValue,
  onChange,
  onValueChange,
  onBlur,
  onFocus,
  onKeyDown,
  onPaste,
  onWheel,
  disabled,
  readOnly,
  min,
  max,
  size,
  ...props
}: InputCurrencyProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const lastEmittedRef = React.useRef<string | null | undefined>(undefined)

  const [probeAmount, setProbeAmount] = React.useState(() => {
    if (typeof value === "number" && isFiniteNumber(value)) {
      return computeRoundedAmount(value, locale, currency, min, max)
    }
    if (typeof defaultValue === "number" && isFiniteNumber(defaultValue)) {
      return computeRoundedAmount(defaultValue, locale, currency, min, max)
    }
    return 0
  })

  const [uncontrolledDisplay, setUncontrolledDisplay] = React.useState(() => {
    if (typeof defaultValue === "string")
      return sanitizeCurrencyDecimalInput(defaultValue, locale, currency)
    if (typeof defaultValue === "number" && isFiniteNumber(defaultValue)) {
      const rounded = computeRoundedAmount(defaultValue, locale, currency, min, max)
      return getCurrencyFormatParts(locale, currency, rounded).numericDisplay
    }
    return ""
  })
  const [numberDraft, setNumberDraft] = React.useState<string | null>(null)
  const [focused, setFocused] = React.useState(false)

  const isStringControlled = typeof value === "string"
  const isNumberControlled = isFiniteNumber(value)
  const bounds = sanitizeBounds(min, max)
  const stringControlledValue = isStringControlled
    ? getStringControlledDisplay(value, focused, locale, currency, min, max)
    : ""

  const numberControlledValue = isNumberControlled
    ? (() => {
        const rounded = computeRoundedAmount(value, locale, currency, min, max)
        return getCurrencyFormatParts(locale, currency, rounded).numericDisplay
      })()
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
    if (!isNumberControlled || !isFiniteNumber(value)) return
    setProbeAmount(computeRoundedAmount(value, locale, currency, min, max))
  }, [isNumberControlled, value, locale, currency, min, max])

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
    (nextValue: string | null) => {
      if (lastEmittedRef.current !== undefined && lastEmittedRef.current === nextValue) {
        return
      }
      lastEmittedRef.current = nextValue
      onValueChange?.(nextValue)
    },
    [onValueChange],
  )

  const commitDisplayValue = React.useCallback(
    (rawValue: string, source?: HTMLInputElement | null) => {
      const sanitized = sanitizeCurrencyDecimalInput(rawValue, locale, currency)
      const parsed = parseCurrencyStringToNumber(sanitized, locale, currency)
      if (parsed === null) {
        updateLocalDisplay(sanitized)
        emitChange(sanitized, source)
        emitValueChange(null)
        return
      }

      const clamped = clampNumber(parsed, bounds.min, bounds.max)
      const fd = getCurrencyFractionDigits(locale, currency)
      const rounded = roundToCurrencyMinorUnits(clamped, fd)
      setProbeAmount(rounded)
      const normalized = normalizeDecimalString(rounded, fd)
      const { numericDisplay } = getCurrencyFormatParts(locale, currency, rounded)

      updateLocalDisplay(numericDisplay)
      emitChange(numericDisplay, source)
      emitValueChange(normalized)
    },
    [bounds.max, bounds.min, currency, emitChange, emitValueChange, locale, updateLocalDisplay],
  )

  const { symbol, addonAlign } = getCurrencyFormatParts(locale, currency, probeAmount)

  return (
    <InputGroup data-slot="input-currency" size={size} className={className}>
      <InputGroupInput
        {...props}
        ref={inputRef}
        className="rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent"
        type="text"
        inputMode="decimal"
        disabled={disabled}
        readOnly={readOnly}
        value={displayValue}
        onChange={(event) => {
          const sanitized = sanitizeCurrencyDecimalInput(
            event.currentTarget.value,
            locale,
            currency,
          )
          updateLocalDisplay(sanitized)
          emitChange(sanitized, event.currentTarget)
        }}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
          if (isNumberControlled && isFiniteNumber(value)) {
            const rounded = computeRoundedAmount(value, locale, currency, min, max)
            const intlNumeric = getCurrencyFormatParts(locale, currency, rounded).numericDisplay
            setNumberDraft((prev) => {
              if (prev !== null && prev !== intlNumeric) return prev
              return committedAmountToTypingDraft(rounded, locale, currency)
            })
          } else if (!isStringControlled && !isNumberControlled) {
            const rounded = probeAmount
            const intlNumeric = getCurrencyFormatParts(locale, currency, rounded).numericDisplay
            setUncontrolledDisplay((prev) => {
              if (prev !== intlNumeric) return prev
              return committedAmountToTypingDraft(rounded, locale, currency)
            })
          }
        }}
        onBlur={(event) => {
          onBlur?.(event)
          if (event.defaultPrevented || disabled) {
            setFocused(false)
            return
          }
          commitDisplayValue(event.currentTarget.value, event.currentTarget)
          setFocused(false)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || disabled) return

          if (event.key === "Enter") {
            event.preventDefault()
            commitDisplayValue(event.currentTarget.value, event.currentTarget)
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
          const sanitized = sanitizeCurrencyDecimalInput(nextRaw, locale, currency)

          updateLocalDisplay(sanitized)
          emitChange(sanitized, input)
        }}
        onWheel={(event) => {
          onWheel?.(event)
          event.preventDefault()
        }}
      />
      <InputGroupAddon
        align={addonAlign}
        className="px-2 text-sm text-muted-foreground tabular-nums select-none group-has-[input[aria-invalid=true]]/input-group:text-destructive"
      >
        <span aria-hidden>{symbol}</span>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { InputCurrency }
