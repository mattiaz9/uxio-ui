"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/uxio/overrides-input-group-radix/input-group"
import { IconPlaceholder } from "@/registry/uxio/shared/icon-placeholder/icon-placeholder"

type InputPasswordProps = Omit<React.ComponentProps<typeof InputGroupInput>, "type" | "size"> &
  Pick<React.ComponentProps<typeof InputGroup>, "size">

function InputPassword({
  className,
  disabled,
  readOnly,
  autoComplete = "current-password",
  size,
  ...props
}: InputPasswordProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <InputGroup size={size} className={cn("cn-input-password", className)}>
      <InputGroupInput
        {...props}
        type={visible ? "text" : "password"}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
      />
      <InputGroupAddon align="inline-end" className="px-1 text-muted-foreground">
        <InputGroupButton
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={disabled || readOnly}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <IconPlaceholder
              className="size-4"
              lucide="EyeOffIcon"
              tabler="IconEyeOff"
              hugeicons="ViewOffIcon"
              phosphor="EyeSlashIcon"
              remixicon="RiEyeOffLine"
            />
          ) : (
            <IconPlaceholder
              className="size-4"
              lucide="EyeIcon"
              tabler="IconEye"
              hugeicons="ViewIcon"
              phosphor="EyeIcon"
              remixicon="RiEyeLine"
            />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { InputPassword }
