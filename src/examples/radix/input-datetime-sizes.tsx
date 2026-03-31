"use client"

import { InputDatetime } from "./ui/input-datetime"

export default function InputDatetimeSizesExample() {
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
          <InputDatetime mode="datetime" size={size} name={`dt-${size}`} />
        </div>
      ))}
    </div>
  )
}
