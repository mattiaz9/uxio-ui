import { SaveIcon } from "lucide-react"

import { Button } from "./ui/button"

export default function ButtonLoading() {
  return (
    <Button loading>
      <SaveIcon data-icon="inline-start" />
      Saving...
    </Button>
  )
}
