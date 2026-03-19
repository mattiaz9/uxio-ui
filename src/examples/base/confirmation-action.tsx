"use client"

import { Button } from "./ui/button"
import { confirm } from "./ui/confirmation"

export default function ConfirmationAction() {
  function handleClick() {
    void confirm({
      title: "Delete Post",
      description: "This action is not reversible. Are you sure you want to proceed?",
      variant: "destructive",
      confirmButtonTitle: "Delete post",
      displayError: "below-content",
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        throw new Error("Simulated delete failure")
      },
    })
  }

  return (
    <Button variant="destructive" onClick={handleClick}>
      Delete post
    </Button>
  )
}
