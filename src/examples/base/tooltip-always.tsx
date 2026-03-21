import { AutoTooltip } from "./ui/tooltip"

export default function TooltipAlways() {
  return (
    <div className="flex flex-col items-center">
      <AutoTooltip
        content="This tooltip can open even though the text is not truncated."
        mode="always"
      >
        <span className="block cursor-default text-sm">Short label</span>
      </AutoTooltip>
    </div>
  )
}
