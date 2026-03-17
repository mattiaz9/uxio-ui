import type { ReactNode } from "react"

export function ComponentPreview({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={
        "not-prose my-6 flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-border bg-muted/30 p-8 " +
        (className ?? "")
      }
    >
      {children}
    </div>
  )
}
