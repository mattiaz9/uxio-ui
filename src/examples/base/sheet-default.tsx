import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { Button } from "./ui/button"

export default function SheetDefault() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 py-2">
          <p className="text-sm text-muted-foreground">
            Panel surface uses <code className="text-foreground">bg-popover</code>, aligned with
            the dialog override.
          </p>
        </div>
        <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <SheetClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="button">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
