"use client"

import { InputNumber } from "./ui/input-number"

export default function InputNumberSizesExample() {
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
          <InputNumber size={size} defaultValue={42} min={0} step={1} />
        </div>
      ))}
    </div>
  )
}
