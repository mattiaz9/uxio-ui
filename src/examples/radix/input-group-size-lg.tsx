import { SearchIcon } from "lucide-react"

import { Button } from "./ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"

export default function InputGroupSizeLg() {
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <InputGroup size="lg" className="max-w-xs">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <SearchIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="button" variant="default">
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <Button size="lg">Button</Button>
    </div>
  )
}
