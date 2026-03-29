"use client"

import * as React from "react"

import { InputDuration } from "./ui/input-duration"

/** Same as 1 day + 2h + 30m — needs time fields so the remainder fits the calendar segments. */
const SAMPLE_SECONDS = 95400

export default function InputDurationYearsMonthsDaysExample() {
  const [committed, setCommitted] = React.useState<number | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputDuration
        format="yy'y' MM'm' dd'd' HH'h' mm'm'"
        defaultValue={SAMPLE_SECONDS}
        onValueChange={setCommitted}
      />
      <p className="text-xs text-muted-foreground">
        Format includes years, months, and days plus hours and minutes so total seconds can be split
        across all units. Committed value is total seconds.
        <br />
        <span className="font-medium text-foreground">Committed (seconds): </span>
        {committed === null ? "—" : String(committed)}
      </p>
    </div>
  )
}
