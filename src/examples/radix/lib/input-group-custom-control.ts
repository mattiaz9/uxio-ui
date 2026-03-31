import { cn } from "@/lib/utils"

/**
 * Padding and text scale for custom controls inside `InputGroup` when the visible field is not
 * `InputGroupInput` (e.g. segment UIs). Mirrors the theme’s `cn-input-size-*` tokens.
 */
export function cnInputGroupCustomControl(
  size: "xs" | "sm" | "default" | "lg" | null | undefined,
  options?: { disabled?: boolean },
): string {
  const { disabled } = options ?? {}
  return cn(
    "cn-input-group-input flex h-full min-h-0 flex-1 flex-wrap items-center gap-0.5",
    size === "xs" && "px-2 py-0.5 text-xs",
    size === "sm" && "px-2.5 py-1 text-sm",
    (size === undefined || size === "default") && "px-2.5 py-1 text-base md:text-sm",
    size === "lg" && "px-2.5 py-1.5 text-base md:text-sm",
    disabled && "pointer-events-none opacity-50",
  )
}
