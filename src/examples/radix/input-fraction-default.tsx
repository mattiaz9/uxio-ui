"use client"

import * as React from "react"

import { InputFraction } from "./ui/input-fraction"

export default function InputFractionDefaultExample() {
  const [committed, setCommitted] = React.useState<string | null>(null)
  const [partial, setPartial] = React.useState("")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputFraction
        name="fraction"
        onChange={(e) => setPartial(e.target.value)}
        onValueChange={setCommitted}
      />
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Committed (onValueChange): </span>
          {committed ?? "—"}
        </p>
        <p>
          <span className="font-medium text-foreground">Hidden string (onChange): </span>
          {partial ? partial : "—"}
        </p>
      </div>
    </div>
  )
}
