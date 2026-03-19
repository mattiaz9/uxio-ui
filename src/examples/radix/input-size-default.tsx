import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function InputSizeDefault() {
  return (
    <div className="flex items-center gap-2">
      <Input size="default" placeholder="Default input" />
      <Button size="default">Button</Button>
    </div>
  )
}
