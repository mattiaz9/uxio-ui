"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content> & {
  /** When `true`, renders a pointer arrow toward the anchor. */
  arrow?: boolean
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  children,
  arrow = false,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "cn-popover-content z-50 w-72 origin-(--radix-popover-content-transform-origin) outline-hidden",
          arrow && "group/popover",
          className,
        )}
        {...props}
      >
        {props.asChild ? (
          children
        ) : arrow ? (
          <>
            {children}
            <PopoverPrimitive.Arrow
              className="h-3 w-5 fill-popover group-data-[side=bottom]/popover:-translate-y-px group-data-[side=left]/popover:-translate-y-px group-data-[side=right]/popover:-translate-y-px"
              asChild
            >
              <svg viewBox="0 0 30 10" preserveAspectRatio="none">
                <polygon points="0,0 30,0 15,10"></polygon>
                <line
                  className="stroke stroke-border"
                  vectorEffect="non-scaling-stroke"
                  x1="1"
                  y1="1"
                  x2="15"
                  y2="10"
                />
                <line
                  className="stroke stroke-border"
                  vectorEffect="non-scaling-stroke"
                  x1="29"
                  y1="1"
                  x2="15"
                  y2="10"
                />
              </svg>
            </PopoverPrimitive.Arrow>
          </>
        ) : (
          children
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="popover-header" className={cn("cn-popover-header", className)} {...props} />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <div data-slot="popover-title" className={cn("cn-popover-title", className)} {...props} />
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("cn-popover-description", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
