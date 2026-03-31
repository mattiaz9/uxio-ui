import { SearchIcon } from "lucide-react"

import { Button } from "./ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group"

export default function InputGroupSizeDefault() {
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <InputGroup size="default" className="max-w-xs">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <SearchIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="button" variant="secondary">
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <Button size="default">Button</Button>
    </div>
  )
}
