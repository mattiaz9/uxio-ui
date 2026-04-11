"use client"

import * as React from "react"

import { InputNumber } from "./ui/input-number"

export default function InputNumberDefaultExample() {
  const [text, setText] = React.useState("")
  const [committed, setCommitted] = React.useState<number | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputNumber
        value={text}
        step={1}
        placeholder="0"
        onChange={(event) => setText(event.target.value)}
        onValueChange={setCommitted}
      />
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Visible text (onChange): </span>
          {text || "—"}
        </p>
        <p>
          <span className="font-medium text-foreground">Committed value (onValueChange): </span>
          {committed === null ? "—" : String(committed)}
        </p>
      </div>
    </div>
  )
}
