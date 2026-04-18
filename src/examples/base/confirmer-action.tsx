"use client"

import { Button } from "./ui/button"
import { confirm } from "./ui/confirmer"

async function runAsyncAction(abortSignal: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, 3000)
    abortSignal.addEventListener(
      "abort",
      () => {
        clearTimeout(id)
        reject(new DOMException("Aborted", "AbortError"))
      },
      { once: true },
    )
  })
  throw new Error("Simulated delete failure")
}

const baseOptions = {
  title: "Delete Post",
  description: "This action is not reversible. Are you sure you want to proceed?",
  variant: "destructive" as const,
  confirmButtonTitle: "Delete post",
  displayError: "below-content" as const,
  action: runAsyncAction,
}

export default function ConfirmerAction() {
  function handleClick(lockCancelWhilePending: boolean) {
    void confirm({
      ...baseOptions,
      ...(lockCancelWhilePending ? { disableCancelWhilePending: true } : {}),
    })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="destructive" onClick={() => handleClick(false)}>
        Destructive (async)
      </Button>
      <Button variant="destructive" onClick={() => handleClick(true)}>
        Destructive (cancel disabled while pending)
      </Button>
    </div>
  )
}
