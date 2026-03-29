"use client"

import * as React from "react"

import { InputDuration } from "./ui/input-duration"

/** 1 day + 2h + 30m in seconds */
const ONE_DAY_TWO_H_THIRTY_M = 95400

export default function InputDurationFormatYmdExample() {
  const [committed, setCommitted] = React.useState<number | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputDuration
        format="dd'd' HH'h' mm'm'"
        defaultValue={ONE_DAY_TWO_H_THIRTY_M}
        onValueChange={setCommitted}
      />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Committed (seconds): </span>
        {committed === null ? "—" : String(committed)}
      </p>
    </div>
  )
}
