import { ScrollArea } from "./ui/scroll-area"

export default function ScrollAreaScrollbarHorizontal() {
  return (
    <ScrollArea scrollbar="horizontal" className="w-full max-w-xs rounded-md border">
      <div className="flex w-max gap-4 p-4">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="bg-muted text-muted-foreground flex size-16 shrink-0 items-center justify-center rounded-md text-xs"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
