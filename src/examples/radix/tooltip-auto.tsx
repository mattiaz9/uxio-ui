import { AutoTooltip } from "./ui/tooltip"

const longLabel =
  "This label is intentionally long so it truncates inside a narrow container and the tooltip only appears then."

export default function TooltipAuto() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full max-w-[11rem]">
        <AutoTooltip content={longLabel} mode="auto">
          <span className="block w-full cursor-default truncate text-sm">{longLabel}</span>
        </AutoTooltip>
      </div>
      <AutoTooltip content="This should not appear in auto mode when the label fits." mode="auto">
        <span className="block cursor-default text-sm">Short label</span>
      </AutoTooltip>
    </div>
  )
}
