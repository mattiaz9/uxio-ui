"use client"

import { InputFraction } from "./ui/input-fraction"

export default function InputFractionSizesExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      {(
        [
          ["xs", "xs"],
          ["sm", "sm"],
          ["default", "default"],
          ["lg", "lg"],
        ] as const
      ).map(([label, size]) => (
        <div key={size} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <InputFraction size={size} name={`fr-${size}`} defaultValue="3/4" />
        </div>
      ))}
    </div>
  )
}
