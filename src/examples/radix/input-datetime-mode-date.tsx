"use client"

import * as React from "react"

import { InputDatetime } from "./ui/input-datetime"

export default function InputDatetimeModeDateExample() {
  const [committed, setCommitted] = React.useState<Date | null>(null)
  const [partial, setPartial] = React.useState("")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputDatetime
        mode="date"
        name="appointment_date"
        onChange={(e) => setPartial(e.target.value)}
        onValueChange={setCommitted}
      />
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Committed (onValueChange): </span>
          {committed ? committed.toISOString().slice(0, 10) : "—"}
        </p>
        <p>
          <span className="font-medium text-foreground">Hidden string (onChange): </span>
          {partial ? partial : "—"}
        </p>
      </div>
    </div>
  )
}
