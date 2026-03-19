import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function InputSizeLg() {
  return (
    <div className="flex items-center gap-2">
      <Input size="lg" placeholder="Large input" />
      <Button size="lg">Button</Button>
    </div>
  )
}
