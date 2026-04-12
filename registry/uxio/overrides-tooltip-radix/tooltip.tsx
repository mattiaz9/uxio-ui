"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  container,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  container?: HTMLElement | null
}) {
  return (
    <TooltipPrimitive.Portal container={container ?? undefined}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "cn-tooltip-content z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) bg-foreground text-background",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="cn-tooltip-arrow z-50 translate-y-[calc(-50%_-_2px)] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
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

  const mergeRefs =
    <T,>(...refs: Array<React.Ref<T> | undefined | null>): React.RefCallback<T> =>
    (value) => {
      for (const ref of refs) {
        if (ref == null) continue
        if (typeof ref === "function") ref(value)
        else ref.current = value
      }
    }

  const childDomRef = (element: React.ReactElement): React.Ref<HTMLElement | null> | undefined => {
    type WithRef = { ref?: React.Ref<HTMLElement | null> }
    const propsRef = (element.props as WithRef).ref
    const legacyRef = (element as unknown as WithRef).ref
    return propsRef ?? legacyRef
  }

  if (!content && !htmlContent) return children

  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip open={canOpen ? undefined : false}>
        <TooltipTrigger asChild>
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
                ref: mergeRefs((el) => setContentRef(el), childDomRef(children)),
              })
            : children}
        </TooltipTrigger>
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
