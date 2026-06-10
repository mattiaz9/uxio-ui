"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        xs: "cn-input-size-xs",
        sm: "cn-input-size-sm",
        default: "cn-input-size-default",
        lg: "cn-input-size-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    onCommitValue?: React.ChangeEventHandler<HTMLInputElement>
  }

function Input({
  className,
  type,
  size = "default",
  onBlur,
  onKeyDown,
  onChange,
  onCommitValue,
  disabled,
  ref,
  ...props
}: InputProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const lastCommittedValueRef = React.useRef<string | undefined>(undefined)

  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [])

  const emitCommitValue = React.useCallback(
    (source?: HTMLInputElement | null) => {
      const target = source ?? inputRef.current
      if (!target) return
      const nextValue = target.value
      if (
        lastCommittedValueRef.current !== undefined &&
        lastCommittedValueRef.current === nextValue
      ) {
        return
      }
      lastCommittedValueRef.current = nextValue
      onCommitValue?.({
        target: { value: nextValue } as HTMLInputElement,
        currentTarget: target,
      } as React.ChangeEvent<HTMLInputElement>)
    },
    [onCommitValue],
  )

  return (
    <input
      type={type}
      data-size={size}
      ref={inputRef}
      disabled={disabled}
      className={cn(inputVariants({ size }), className)}
      onChange={(event) => {
        lastCommittedValueRef.current = undefined
        onChange?.(event)
      }}
      onBlur={(event) => {
        onBlur?.(event)
        if (event.defaultPrevented || disabled) return
        emitCommitValue(event.currentTarget)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || disabled) return

        if (event.key === "Enter" && onCommitValue) {
          event.preventDefault()
          emitCommitValue(event.currentTarget)
        }
      }}
      {...props}
    />
  )
}

export { Input, inputVariants }
