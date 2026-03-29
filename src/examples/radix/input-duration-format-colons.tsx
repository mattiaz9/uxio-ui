"use client"

import * as React from "react"

import { InputDuration } from "./ui/input-duration"

export default function InputDurationFormatColonsExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputDuration format="HH:mm:ss" name="elapsed" />
      <p className="text-xs text-muted-foreground">
        Colons as separators only — no unit letters. Same token rules as{" "}
        <code className="text-foreground">Input DateTime</code>.
      </p>
    </div>
  )
}
