"use client"

import { Button } from "./ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

export default function DialogFooterBorderExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Save changes</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You have unsaved edits. Close anyway or go back to keep editing.
          </p>
        </DialogBody>
        <DialogFooter className="border-t border-border">
          <Button type="button" variant="outline">
            Discard
          </Button>
          <Button type="button">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
