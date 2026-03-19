"use client"

import { useState } from "react"

import { confirm } from "./ui/confirmation"
import { Button } from "./ui/button"

export default function ConfirmationReturn() {
  const [result, setResult] = useState<string | null>(null)

  async function handleClick() {
    const confirmed = await confirm({
      title: "Close document",
      description: "All changes will not be saved",
      variant: "default",
      confirmButtonTitle: "OK",
    })

    if (confirmed) {
      setResult("Confirmed!")
    } else {
      setResult("Cancelled")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" onClick={handleClick}>
        Close document
      </Button>
      {result && (
        <p className="text-sm text-muted-foreground">Result: {result}</p>
      )}
    </div>
  )
}
