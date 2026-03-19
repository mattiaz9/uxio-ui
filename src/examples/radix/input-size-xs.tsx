import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function InputSizeXs() {
  return (
    <div className="flex items-center gap-2">
      <Input size="xs" placeholder="Extra small input" />
      <Button size="xs">Button</Button>
    </div>
  )
}
