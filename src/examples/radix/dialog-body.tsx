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

export default function DialogBodyExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Scrollable body</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {Array.from({ length: 28 }, (_, i) => (
            <p key={i} className="text-muted-foreground text-sm leading-relaxed">
              Section {i + 1}. In a real screen this might be terms, a long form, or stacked
              sections. The body scrolls independently so the header and footer stay visible.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <Button type="button">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
