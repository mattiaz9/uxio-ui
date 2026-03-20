import { ScrollArea } from "./ui/scroll-area"

export default function ScrollAreaScrollbarVertical() {
  return (
    <ScrollArea className="h-48 w-48 rounded-md border">
      <div className="space-y-2 p-4">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
