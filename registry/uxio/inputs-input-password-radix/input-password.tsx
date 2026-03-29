"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/registry/uxio/overrides-input-group-radix/input-group"
import { Input } from "@/registry/uxio/overrides-input-radix/input"
import { IconPlaceholder } from "@/registry/uxio/shared/icon-placeholder/icon-placeholder"

type InputPasswordProps = Omit<React.ComponentProps<typeof Input>, "type">

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(function InputPassword(
  { className, disabled, readOnly, autoComplete = "current-password", ...props },
  ref,
) {
  const [visible, setVisible] = React.useState(false)

  return (
    <InputGroup className="cn-input-password">
      <Input
        {...props}
        ref={ref}
        className={cn("cn-input-group-input flex-1", className)}
        type={visible ? "text" : "password"}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        data-slot="input-group-control"
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
          <IconPlaceholder
            className="size-4"
            lucide={visible ? "EyeOffIcon" : "EyeIcon"}
            tabler={visible ? "IconEyeOff" : "IconEye"}
            hugeicons={visible ? "ViewOffIcon" : "ViewIcon"}
            phosphor={visible ? "eye-slash" : "eye"}
            remixicon={visible ? "RiEyeOffLine" : "RiEyeLine"}
          />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
})

export { InputPassword }
