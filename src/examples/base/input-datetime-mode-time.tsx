"use client"

import * as React from "react"

import { InputDatetime } from "./ui/input-datetime"

export default function InputDatetimeModeTimeExample() {
  const [committed, setCommitted] = React.useState<Date | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputDatetime mode="time" format="HH:mm" onValueChange={setCommitted} />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Committed time: </span>
        {committed
          ? committed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
          : "Fill HH:mm or pick a day in the calendar (reference date)."}
      </p>
    </div>
  )
}
