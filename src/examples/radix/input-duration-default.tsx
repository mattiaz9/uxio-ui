"use client"

import * as React from "react"

import { InputDuration } from "./ui/input-duration"

export default function InputDurationDefaultExample() {
  const [committed, setCommitted] = React.useState<number | null>(null)
  const [lastChange, setLastChange] = React.useState("")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputDuration
        name="duration"
        onChange={(e) => setLastChange(e.target.value)}
        onValueChange={setCommitted}
      />
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Committed seconds (onValueChange): </span>
          {committed === null ? "—" : String(committed)}
        </p>
        <p>
          <span className="font-medium text-foreground">Hidden input (onChange, same as commit): </span>
          {lastChange ? lastChange : "—"}
        </p>
      </div>
    </div>
  )
}
