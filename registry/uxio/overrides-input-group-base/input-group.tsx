import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/uxio/overrides-button-base/button"
import { Input } from "@/registry/uxio/overrides-input-base/input"
import { Textarea } from "@/registry/uxio/overrides-textarea-base/textarea"

const inputGroupVariants = cva(
  "group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
  {
    variants: {
      size: {
        xs: "cn-input-group-size-xs",
        sm: "cn-input-group-size-sm",
        default: "cn-input-group-size-default",
        lg: "cn-input-group-size-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

type InputGroupSize = NonNullable<VariantProps<typeof inputGroupVariants>["size"]>

const InputGroupSizeContext = React.createContext<InputGroupSize>("default")

function InputGroup({
  className,
  size: sizeProp,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupVariants>) {
  const size: InputGroupSize = sizeProp ?? "default"
  return (
    <InputGroupSizeContext.Provider value={size}>
      <div
        data-slot="input-group"
        data-size={size}
        role="group"
        className={cn(inputGroupVariants({ size }), className)}
        {...props}
      />
    </InputGroupSizeContext.Provider>
  )
}

const inputGroupAddonVariants = cva(
  "cn-input-group-addon flex cursor-text items-center justify-center select-none",
  {
    variants: {
      align: {
        "inline-start": "cn-input-group-addon-align-inline-start order-first",
        "inline-end": "cn-input-group-addon-align-inline-end order-last",
        "block-start": "cn-input-group-addon-align-block-start order-first w-full justify-start",
        "block-end": "cn-input-group-addon-align-block-end order-last w-full justify-start",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement
          ?.querySelector<HTMLElement>("[data-slot=input-group-control]")
          ?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva("cn-input-group-button flex items-center shadow-none", {
  variants: {
    size: {
      "2xs": "cn-input-group-button-size-2xs",
      xs: "cn-input-group-button-size-xs",
      sm: "cn-input-group-button-size-sm",
      "icon-xs": "cn-input-group-button-size-icon-xs",
      "icon-sm": "cn-input-group-button-size-icon-sm",
    },
  },
  defaultVariants: {
    size: "xs",
  },
})

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  const groupSize = React.useContext(InputGroupSizeContext)
  const resolvedSize =
    size ??
    (() => {
      switch (groupSize) {
        case "xs":
          return "2xs"
        case "sm":
        case "default":
          return "xs"
        case "lg":
          return "sm"
      }
    })()

  return (
    <Button
      type={type}
      data-size={resolvedSize}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size: resolvedSize }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("cn-input-group-text flex items-center [&_svg]:pointer-events-none", className)}
      {...props}
    />
  )
}

function InputGroupInput({ className, size, ...props }: React.ComponentProps<typeof Input>) {
  const groupSize = React.useContext(InputGroupSizeContext)
  const resolvedSize = size ?? groupSize
  return (
    <Input
      data-slot="input-group-control"
      size={resolvedSize}
      className={cn("cn-input-group-input flex-1", className)}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn("cn-input-group-textarea flex-1 resize-none", className)}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
  inputGroupVariants,
}
