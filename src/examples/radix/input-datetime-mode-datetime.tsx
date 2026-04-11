"use client"

import * as React from "react"

import { InputDatetime } from "./ui/input-datetime"

export default function InputDatetimeModeDatetimeExample() {
  const [value, setValue] = React.useState<Date | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputDatetime mode="datetime" value={value ?? undefined} onValueChange={setValue} />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Controlled value: </span>
        {value
          ? value.toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "—"}
      </p>
    </div>
  )
}
