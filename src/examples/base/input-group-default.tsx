import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "./ui/input-group"
import { SearchIcon } from "lucide-react"

export default function InputGroupDefault() {
  return (
    <InputGroup className="max-w-xs">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon className="size-4 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  )
}
