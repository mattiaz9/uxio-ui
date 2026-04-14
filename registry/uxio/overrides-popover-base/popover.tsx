"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    /** When `true`, renders a pointer arrow toward the anchor. */
    arrow?: boolean
  }

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 8,
  children,
  arrow = false,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "cn-popover-content cn-popover-content-logical z-50 w-72 origin-(--transform-origin) outline-hidden",
            className,
          )}
          {...props}
        >
          {children}
          {arrow ? (
            <PopoverPrimitive.Arrow
              className={cn(
                "flex h-2 w-4 fill-popover",
                "data-[side=top]:bottom-[-8px]",
                "data-[side=bottom]:top-[-8px] data-[side=bottom]:rotate-180",
                "data-[side=left]:right-[-11px] data-[side=left]:-rotate-90",
                "data-[side=right]:left-[-11px] data-[side=right]:rotate-90",
                "data-[side=inline-start]:right-[-11px] data-[side=inline-start]:-rotate-90",
                "data-[side=inline-end]:left-[-11px] data-[side=inline-end]:rotate-90",
              )}
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
          ) : null}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="popover-header" className={cn("cn-popover-header", className)} {...props} />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("cn-popover-title", className)}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("cn-popover-description", className)}
      {...props}
    />
  )
}

export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger }
