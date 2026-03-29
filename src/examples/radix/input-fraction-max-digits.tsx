"use client"

import * as React from "react"

import { InputFraction } from "./ui/input-fraction"

export default function InputFractionMaxDigitsExample() {
  const [committed, setCommitted] = React.useState<string | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputFraction maxDigits={3} onValueChange={setCommitted} name="short_fraction" />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Committed: </span>
        {committed ?? "—"}
      </p>
      <p className="text-xs text-muted-foreground">
        Each segment accepts at most three digits (e.g. up to <code className="text-foreground">999/999</code>
        ).
      </p>
    </div>
  )
}
