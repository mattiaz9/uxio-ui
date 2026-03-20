import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "cn-skeleton animate-shimmer bg-muted bg-linear-120 from-transparent from-30% via-background to-transparent to-70%",
        className,
      )}
      style={{
        ...style,
        backgroundSize: "200% 100%",
        backgroundRepeat: "no-repeat",
        backgroundOrigin: "border-box",
      }}
      {...props}
    />
  )
}

export { Skeleton }
