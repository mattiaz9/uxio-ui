import { SearchIcon } from "lucide-react"

import { Button } from "./ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group"

export default function InputGroupSizeXs() {
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <InputGroup size="xs" className="max-w-xs">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <SearchIcon className="size-3.5 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="button" variant="default">
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <Button size="xs">Button</Button>
    </div>
  )
}
