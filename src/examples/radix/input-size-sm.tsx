import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function InputSizeSm() {
  return (
    <div className="flex items-center gap-2">
      <Input size="sm" placeholder="Small input" />
      <Button size="sm">Button</Button>
    </div>
  )
}
