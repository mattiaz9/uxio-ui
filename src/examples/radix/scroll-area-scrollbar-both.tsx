import { ScrollArea } from "./ui/scroll-area"

export default function ScrollAreaScrollbarBoth() {
  return (
    <ScrollArea scrollbar="both" className="h-48 w-64 rounded-md border">
      <div className="flex min-h-[220px] min-w-[520px] flex-wrap gap-2 p-4">
        {Array.from({ length: 48 }, (_, i) => (
          <div
            key={i}
            className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-md text-xs"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
