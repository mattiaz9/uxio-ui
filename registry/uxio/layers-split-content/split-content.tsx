import * as React from "react"

import { cn } from "@/lib/utils"

function SplitContent({
  className,
  variant = "responsive",
  ratio = "1:1",
  breakpointQuery = "media",
  children,
  ...props
}: React.ComponentProps<"section"> & {
  variant?: "responsive" | "fixed"
  ratio?: "1:1" | "1:2" | "2:1"
  /** `media`: viewport `md:`. `container`: responsive layout uses `@container` + `@md:`; also sets `--container-inset` (padding, then `cqw` gutter from `md`). Inset still applies when `variant` is `fixed` if you need a parent `@container` for `cqw`. */
  breakpointQuery?: "media" | "container"
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

  const useContainer = variant === "responsive" && breakpointQuery === "container"
  const useContainerInset = breakpointQuery === "container"

  const section = (
    <section
      className={cn(
        "grid grid-cols-[var(--container-inset)_repeat(6,1fr)_var(--container-inset)] divide-border",
        useContainerInset && [
          "[--container-inset:var(--container-padding)]",
          "@md:[--container-inset:calc(50cqw_-_min(100cqw,var(--container-max-width))_/_2_+_var(--container-padding))]",
        ],
        variant === "responsive" &&
          (useContainer
            ? "*:last:row-start-2 @md:*:last:row-start-1"
            : "*:last:row-start-2 md:*:last:row-start-1"),
        variant === "responsive" && [
          "has-[>:first-child[data-anchor=container]]:[--left-span:6] has-[>:first-child[data-anchor=container]]:[--left-start:2]",
          "has-[>:first-child[data-anchor=screen]]:[--left-span:8] has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
          "has-[>:last-child[data-anchor=container]]:[--right-span:6] has-[>:last-child[data-anchor=container]]:[--right-start:2]",
          "has-[>:last-child[data-anchor=screen]]:[--right-span:8] has-[>:last-child[data-anchor=screen]]:[--right-start:1]",
        ],
        variant === "responsive" &&
          ratio === "1:1" &&
          (useContainer
            ? [
                "@md:has-[>:first-child[data-anchor=container]]:[--left-span:3] @md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
                "@md:has-[>:first-child[data-anchor=screen]]:[--left-span:4] @md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
                "@md:has-[>:last-child[data-anchor=container]]:[--right-span:3] @md:has-[>:last-child[data-anchor=container]]:[--right-start:5]",
                "@md:has-[>:last-child[data-anchor=screen]]:[--right-span:4] @md:has-[>:last-child[data-anchor=screen]]:[--right-start:5]",
              ]
            : [
                "md:has-[>:first-child[data-anchor=container]]:[--left-span:3] md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
                "md:has-[>:first-child[data-anchor=screen]]:[--left-span:4] md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
                "md:has-[>:last-child[data-anchor=container]]:[--right-span:3] md:has-[>:last-child[data-anchor=container]]:[--right-start:5]",
                "md:has-[>:last-child[data-anchor=screen]]:[--right-span:4] md:has-[>:last-child[data-anchor=screen]]:[--right-start:5]",
              ]),
        variant === "responsive" &&
          ratio === "1:2" &&
          (useContainer
            ? [
                "@md:has-[>:first-child[data-anchor=container]]:[--left-span:2] @md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
                "@md:has-[>:first-child[data-anchor=screen]]:[--left-span:3] @md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
                "@md:has-[>:last-child[data-anchor=container]]:[--right-span:4] @md:has-[>:last-child[data-anchor=container]]:[--right-start:4]",
                "@md:has-[>:last-child[data-anchor=screen]]:[--right-span:5] @md:has-[>:last-child[data-anchor=screen]]:[--right-start:4]",
              ]
            : [
                "md:has-[>:first-child[data-anchor=container]]:[--left-span:2] md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
                "md:has-[>:first-child[data-anchor=screen]]:[--left-span:3] md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
                "md:has-[>:last-child[data-anchor=container]]:[--right-span:4] md:has-[>:last-child[data-anchor=container]]:[--right-start:4]",
                "md:has-[>:last-child[data-anchor=screen]]:[--right-span:5] md:has-[>:last-child[data-anchor=screen]]:[--right-start:4]",
              ]),
        variant === "responsive" &&
          ratio === "2:1" &&
          (useContainer
            ? [
                "@md:has-[>:first-child[data-anchor=container]]:[--left-span:4] @md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
                "@md:has-[>:first-child[data-anchor=screen]]:[--left-span:5] @md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
                "@md:has-[>:last-child[data-anchor=container]]:[--right-span:2] @md:has-[>:last-child[data-anchor=container]]:[--right-start:6]",
                "@md:has-[>:last-child[data-anchor=screen]]:[--right-span:3] @md:has-[>:last-child[data-anchor=screen]]:[--right-start:6]",
              ]
            : [
                "md:has-[>:first-child[data-anchor=container]]:[--left-span:4] md:has-[>:first-child[data-anchor=container]]:[--left-start:2]",
                "md:has-[>:first-child[data-anchor=screen]]:[--left-span:5] md:has-[>:first-child[data-anchor=screen]]:[--left-start:1]",
                "md:has-[>:last-child[data-anchor=container]]:[--right-span:2] md:has-[>:last-child[data-anchor=container]]:[--right-start:6]",
                "md:has-[>:last-child[data-anchor=screen]]:[--right-span:3] md:has-[>:last-child[data-anchor=screen]]:[--right-start:6]",
              ]),
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
      data-breakpoint-query={variant === "responsive" ? breakpointQuery : undefined}
      {...props}
    >
      {children}
    </section>
  )

  if (useContainer) {
    return <div className="@container min-w-0 w-full">{section}</div>
  }

  return section
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
