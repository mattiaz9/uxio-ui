"use client"

import { InputDuration } from "./ui/input-duration"

export default function InputDurationSizesExample() {
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
          <InputDuration size={size} name={`dur-${size}`} defaultValue={3661} />
        </div>
      ))}
    </div>
  )
}
