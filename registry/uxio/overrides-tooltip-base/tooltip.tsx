"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined | null>): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (ref == null) continue
      if (typeof ref === "function") ref(value)
      else ref.current = value
    }
  }
}

function childDomRef(element: React.ReactElement): React.Ref<HTMLElement | null> | undefined {
  type WithRef = { ref?: React.Ref<HTMLElement | null> }
  const propsRef = (element.props as WithRef).ref
  const legacyRef = (element as unknown as WithRef).ref
  return propsRef ?? legacyRef
}

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  container,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    container?: HTMLElement | null
  }) {
  return (
    <TooltipPrimitive.Portal container={container ?? undefined}>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "cn-tooltip-content cn-tooltip-content-logical z-50 w-fit max-w-xs origin-(--transform-origin) bg-foreground text-background",
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="cn-tooltip-arrow cn-tooltip-arrow-logical z-50 bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export interface AutoTooltipProps {
  children: React.ReactElement
  className?: string
  content?: string
  htmlContent?: React.ReactNode
  delay?: number
  offset?: number
  placement?: "top" | "bottom" | "left" | "right"
  appendTo?: HTMLElement | null
  mode?: "auto" | "always"
}

function AutoTooltip({
  children,
  className,
  content,
  htmlContent,
  delay = 250,
  offset,
  placement,
  appendTo,
  mode = "auto",
}: AutoTooltipProps) {
  const [contentRef, setContentRef] = React.useState<HTMLElement | null>(null)
  const [canOpen, setCanOpen] = React.useState(false)

  React.useEffect(() => {
    if (!contentRef) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanOpen(
      mode === "always" ||
        contentRef.scrollWidth > contentRef.clientWidth ||
        contentRef.scrollHeight > contentRef.clientHeight,
    )
  }, [contentRef, mode])

  if (!content && !htmlContent) return children

  return (
    <TooltipProvider delay={delay}>
      <Tooltip disabled={!canOpen}>
        <TooltipTrigger
          {...({
            nativeButton: false,
            render: (
              props: React.ComponentPropsWithoutRef<"span"> & {
                ref?: React.Ref<HTMLElement | null>
              },
            ) =>
              React.cloneElement(
                children as React.ReactElement<Record<string, unknown>>,
                {
                  ...props,
                  ref: mergeRefs(props.ref, (el) => setContentRef(el), childDomRef(children)),
                } as Record<string, unknown>,
              ),
          } as React.ComponentProps<typeof TooltipPrimitive.Trigger>)}
        />
        <TooltipContent
          className={cn("max-w-xs", className)}
          side={placement}
          sideOffset={offset}
          container={appendTo}
        >
          {htmlContent ?? content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, AutoTooltip }
