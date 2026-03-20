import * as React from "react"

import { cn } from "@/lib/utils"

function SplitContent({
  className,
  variant = "responsive",
  ratio = "1:1",
  children,
  ...props
}: React.ComponentProps<"section"> & {
  variant?: "responsive" | "fixed"
  ratio?: "1:1" | "1:2" | "2:1"
}) {
  const nodes = React.Children.toArray(children)
  const items = nodes.filter(
    (child): child is React.ReactElement =>
      React.isValidElement(child) && child.type === SplitContentItem,
  )

  if (items.length !== 2) {
    throw new Error(
      `SplitContent requires exactly 2 SplitContentItem children; received ${items.length}.`,
    )
  }

  return (
    <section
      className={cn(
        "grid grid-cols-[var(--container-inset)_repeat(6,1fr)_var(--container-inset)] divide-border",
        variant === "responsive" && "*:last:row-start-2 md:*:last:row-start-1",
        variant === "responsive" && [
          "has-[>:first-child[data-anchor=container]]:[--left-span:6] has-[>:first-child[data-anchor=container]]:[--left-start:2]",
          "has-[>:first-child[data-anchor=screen]]:[--left-span:8] has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
          "has-[>:last-child[data-anchor=container]]:[--right-span:6] has-[>:last-child[data-anchor=container]]:[--right-start:2]",
          "has-[>:last-child[data-anchor=screen]]:[--right-span:8] has-[>:last-child[data-anchor=screen]]:[--right-start:1]",
        ],
        variant === "responsive" &&
          ratio === "1:1" && [
            "md:has-[>:first-child[data-anchor=container]]:[--left-span:3] md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
            "md:has-[>:first-child[data-anchor=screen]]:[--left-span:4] md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
            "md:has-[>:last-child[data-anchor=container]]:[--right-span:3] md:has-[>:last-child[data-anchor=container]]:[--right-start:5]",
            "md:has-[>:last-child[data-anchor=screen]]:[--right-span:4] md:has-[>:last-child[data-anchor=screen]]:[--right-start:5]",
          ],
        variant === "responsive" &&
          ratio === "1:2" && [
            "md:has-[>:first-child[data-anchor=container]]:[--left-span:2] md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
            "md:has-[>:first-child[data-anchor=screen]]:[--left-span:3] md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
            "md:has-[>:last-child[data-anchor=container]]:[--right-span:4] md:has-[>:last-child[data-anchor=container]]:[--right-start:4]",
            "md:has-[>:last-child[data-anchor=screen]]:[--right-span:5] md:has-[>:last-child[data-anchor=screen]]:[--right-start:4]",
          ],
        variant === "responsive" &&
          ratio === "2:1" && [
            "md:has-[>:first-child[data-anchor=container]]:[--left-span:4] md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
            "md:has-[>:first-child[data-anchor=screen]]:[--left-span:5] md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
            "md:has-[>:last-child[data-anchor=container]]:[--right-span:2] md:has-[>:last-child[data-anchor=container]]:[--right-start:6]",
            "md:has-[>:last-child[data-anchor=screen]]:[--right-span:3] md:has-[>:last-child[data-anchor=screen]]:[--right-start:6]",
          ],
        variant === "fixed" &&
          ratio === "1:1" && [
            "has-[>:first-child[data-anchor=container]]:[--left-span:3] has-[>:first-child[data-anchor=container]]:[--left-start:2]",
            "has-[>:first-child[data-anchor=screen]]:[--left-span:4] has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
            "has-[>:last-child[data-anchor=container]]:[--right-span:3] has-[>:last-child[data-anchor=container]]:[--right-start:5]",
            "has-[>:last-child[data-anchor=screen]]:[--right-span:4] has-[>:last-child[data-anchor=screen]]:[--right-start:5]",
          ],
        variant === "fixed" &&
          ratio === "1:2" && [
            "has-[>:first-child[data-anchor=container]]:[--left-span:2] has-[>:first-child[data-anchor=container]]:[--left-start:2]",
            "has-[>:first-child[data-anchor=screen]]:[--left-span:3] has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
            "has-[>:last-child[data-anchor=container]]:[--right-span:4] has-[>:last-child[data-anchor=container]]:[--right-start:4]",
            "has-[>:last-child[data-anchor=screen]]:[--right-span:5] has-[>:last-child[data-anchor=screen]]:[--right-start:4]",
          ],
        variant === "fixed" &&
          ratio === "2:1" && [
            "has-[>:first-child[data-anchor=container]]:[--left-span:4] has-[>:first-child[data-anchor=container]]:[--left-start:2]",
            "has-[>:first-child[data-anchor=screen]]:[--left-span:5] has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
            "has-[>:last-child[data-anchor=container]]:[--right-span:2] has-[>:last-child[data-anchor=container]]:[--right-start:6]",
            "has-[>:last-child[data-anchor=screen]]:[--right-span:3] has-[>:last-child[data-anchor=screen]]:[--right-start:6]",
          ],
        className,
      )}
      data-slot="split-content"
      data-variant={variant}
      data-ratio={ratio}
      {...props}
    >
      {children}
    </section>
  )
}

function SplitContentItem({
  className,
  anchor,
  ...props
}: React.ComponentProps<"div"> & {
  anchor: "container" | "screen"
}) {
  return (
    <div
      className={cn(
        "first:col-span-(--left-span) first:col-start-(--left-start) last:col-span-(--right-span) last:col-start-(--right-start)",
        className,
      )}
      data-slot="split-content-item"
      data-anchor={anchor}
      {...props}
    />
  )
}

export { SplitContent, SplitContentItem }
