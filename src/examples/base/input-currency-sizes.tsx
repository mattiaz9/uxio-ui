"use client"

import { InputCurrency } from "./ui/input-currency"

export default function InputCurrencySizesExample() {
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
          <InputCurrency currency="USD" locale="en-US" size={size} placeholder="0" />
        </div>
      ))}
    </div>
  )
}
