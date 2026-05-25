"use client"

import * as React from "react"

import { Input } from "./ui/input"

export default function InputCommitValueExample() {
  const [text, setText] = React.useState("")
  const [committed, setCommitted] = React.useState("")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Input
        placeholder="Type and blur or press Enter"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onCommitValue={(event) => setCommitted(event.target.value)}
      />
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Visible text (onChange): </span>
          {text || "—"}
        </p>
        <p>
          <span className="font-medium text-foreground">Committed value (onCommitValue): </span>
          {committed || "—"}
        </p>
      </div>
    </div>
  )
}
