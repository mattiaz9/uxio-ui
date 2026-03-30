"use client"

import * as React from "react"

import { InputFraction } from "./ui/input-fraction"

export default function InputFractionMinMaxExample() {
  const [committed, setCommitted] = React.useState<string | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputFraction
        minNumerator={0}
        maxNumerator={5}
        minDenominator={5}
        maxDenominator={5}
        onValueChange={setCommitted}
        name="days_per_week"
      />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Committed: </span>
        {committed ?? "—"}
      </p>
      <p className="text-xs text-muted-foreground">
        Numerator is clamped to <code className="text-foreground">0–5</code> and denominator to{" "}
        <code className="text-foreground">5</code> on blur or Enter (e.g. remote days out of a 5-day
        week).
      </p>
    </div>
  )
}
