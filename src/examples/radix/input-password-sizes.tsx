"use client"

import { InputPassword } from "./ui/input-password"

export default function InputPasswordSizesExample() {
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
          <InputPassword size={size} placeholder="Password" autoComplete="new-password" />
        </div>
      ))}
    </div>
  )
}
