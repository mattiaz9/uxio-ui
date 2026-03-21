"use client"

import { useState } from "react"

import { Button } from "./ui/button"
import { confirm } from "./ui/confirmer"

export default function ConfirmerReturn() {
  const [result, setResult] = useState<string | null>(null)

  async function runConfirm(label: string, variant: "default" | "success" | "info" | "warning") {
    const confirmed = await confirm({
      title: `${label} dialog`,
      description: "Choose OK to confirm or Cancel to dismiss.",
      variant,
      confirmButtonTitle: "OK",
    })

    setResult(confirmed ? `${label}: confirmed` : `${label}: cancelled`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="default" onClick={() => void runConfirm("Default", "default")}>
          Default
        </Button>
        <Button variant="success" onClick={() => void runConfirm("Success", "success")}>
          Success
        </Button>
        <Button variant="info" onClick={() => void runConfirm("Info", "info")}>
          Info
        </Button>
        <Button variant="warning" onClick={() => void runConfirm("Warning", "warning")}>
          Warning
        </Button>
      </div>
      {result && <p className="text-center text-sm text-muted-foreground">Result: {result}</p>}
    </div>
  )
}
