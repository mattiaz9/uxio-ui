"use client"

import * as React from "react"

import { InputFraction } from "./ui/input-fraction"

export default function InputFractionControlledExample() {
  const [value, setValue] = React.useState<string | null>("3/4")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputFraction value={value} onValueChange={setValue} name="ratio" />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Controlled value: </span>
        {value ?? "null"}
      </p>
    </div>
  )
}
