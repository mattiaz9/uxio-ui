"use client"

import { alert } from "./ui/alerter"
import { Button } from "./ui/button"

export default function AlerterDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="default"
        onClick={() =>
          alert({
            title: "Notice",
            description: "This is an in-app <strong>alert</strong> with one button.",
            variant: "default",
            okButtonTitle: "OK",
          })
        }
      >
        Default
      </Button>
      <Button
        variant="success"
        onClick={() =>
          alert({
            title: "Saved",
            description: "Your changes were applied successfully.",
            variant: "success",
            okButtonTitle: "Great",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="info"
        onClick={() =>
          alert({
            title: "FYI",
            description: "Maintenance is scheduled for Sunday 2am–4am UTC.",
            variant: "info",
            okButtonTitle: "Understood",
          })
        }
      >
        Info
      </Button>
      <Button
        variant="warning"
        onClick={() =>
          alert({
            title: "Careful",
            description: "This shortcut skips the review step.",
            variant: "warning",
            okButtonTitle: "Continue",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          alert({
            title: "Removed",
            description: "The item has been deleted from this list.",
            variant: "destructive",
            okButtonTitle: "Close",
          })
        }
      >
        Destructive
      </Button>
    </div>
  )
}
