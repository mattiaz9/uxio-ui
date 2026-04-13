import { SparklesIcon } from "lucide-react"

import { Badge } from "./ui/badge"

export default function BadgeSizes() {
  return (
    <div className="flex flex-col items-start gap-3">
      <Badge size="xs">
        <SparklesIcon data-icon="inline-start" />
        Extra small
      </Badge>
      <Badge size="sm">
        <SparklesIcon data-icon="inline-start" />
        Small
      </Badge>
      <Badge size="default">
        <SparklesIcon data-icon="inline-start" />
        Default
      </Badge>
      <Badge size="lg">
        <SparklesIcon data-icon="inline-start" />
        Large
      </Badge>
    </div>
  )
}
