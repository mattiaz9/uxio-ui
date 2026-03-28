"use client"

import * as React from "react"

import { InputCurrency } from "./ui/input-currency"

export default function InputCurrencyDefaultExample() {
  const [text, setText] = React.useState("")
  const [committed, setCommitted] = React.useState<string | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputCurrency
        currency="USD"
        locale="en-US"
        value={text}
        min={0}
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
          {committed === null ? "—" : committed}
        </p>
      </div>
    </div>
  )
}
