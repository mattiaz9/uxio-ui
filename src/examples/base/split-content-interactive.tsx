"use client"

import { useId, useState } from "react"

import { SplitContent, SplitContentItem } from "./ui/split-content"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

/** Demo-only: full-bleed column with readable inset-aligned copy */
const screenColumnBg = {
  backgroundImage:
    "linear-gradient(to bottom, oklch(0.15 0.02 260 / 0.55), oklch(0.12 0.03 280 / 0.7)), url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80)",
} as const

const selectClass =
  "mt-1 block w-full min-w-[8rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"

export default function SplitContentInteractive() {
  const id = useId()
  const [variant, setVariant] = useState<"responsive" | "fixed">("responsive")
  const [ratio, setRatio] = useState<"1:1" | "1:2" | "2:1">("1:1")
  const [leftAnchor, setLeftAnchor] = useState<"container" | "screen">("container")
  const [rightAnchor, setRightAnchor] = useState<"container" | "screen">("container")

  return (
    <div className="flex w-full max-w-5xl flex-col justify-center gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium text-foreground" htmlFor={`${id}-variant`}>
          Variant
          <select
            id={`${id}-variant`}
            className={selectClass}
            value={variant}
            onChange={(e) => setVariant(e.target.value as "responsive" | "fixed")}
          >
            <option value="responsive">responsive</option>
            <option value="fixed">fixed</option>
          </select>
        </label>
        <label className="text-sm font-medium text-foreground" htmlFor={`${id}-ratio`}>
          Ratio
          <select
            id={`${id}-ratio`}
            className={selectClass}
            value={ratio}
            onChange={(e) => setRatio(e.target.value as "1:1" | "1:2" | "2:1")}
          >
            <option value="1:1">1:1</option>
            <option value="1:2">1:2</option>
            <option value="2:1">2:1</option>
          </select>
        </label>
        <label className="text-sm font-medium text-foreground" htmlFor={`${id}-left`}>
          Left anchor
          <select
            id={`${id}-left`}
            className={selectClass}
            value={leftAnchor}
            onChange={(e) => setLeftAnchor(e.target.value as "container" | "screen")}
          >
            <option value="container">container</option>
            <option value="screen">screen</option>
          </select>
        </label>
        <label className="text-sm font-medium text-foreground" htmlFor={`${id}-right`}>
          Right anchor
          <select
            id={`${id}-right`}
            className={selectClass}
            value={rightAnchor}
            onChange={(e) => setRightAnchor(e.target.value as "container" | "screen")}
          >
            <option value="container">container</option>
            <option value="screen">screen</option>
          </select>
        </label>
      </div>

      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-[min(24rem,70vh)] w-full overflow-hidden rounded-lg border border-border bg-background"
      >
        <ResizablePanel defaultSize={80} minSize={35} className="min-w-0">
          <div className="flex h-full min-h-0 w-full flex-col overflow-auto">
            <div className="@container flex min-h-full w-full min-w-0 flex-1 flex-col justify-center [--container-max-width:480px]">
              <SplitContent
                variant={variant}
                ratio={ratio}
                breakpointQuery="container"
                className="min-h-[200px] divide-y divide-border @md:min-h-[220px] @md:divide-x @md:divide-y-0"
              >
                <SplitContentItem
                  anchor={leftAnchor}
                  className={cn(
                    "flex flex-col justify-center text-sm",
                    leftAnchor === "container" && "bg-muted/60 p-4 @md:p-6",
                    leftAnchor === "screen" && "bg-cover bg-center py-6 text-white @md:py-8",
                  )}
                  style={leftAnchor === "screen" ? screenColumnBg : undefined}
                >
                  {leftAnchor === "screen" ? (
                    <div className="pr-4 pl-container-inset text-white @md:pr-6">
                      <span className="font-medium text-white">Left column</span>
                      <span className="block text-white/90">
                        anchor={leftAnchor}
                        <span className="mt-1 block text-xs text-white/80">
                          Full-bleed background in the outer column;{" "}
                          <code className="rounded bg-black/25 px-1 py-0.5 font-mono text-[0.7rem] text-white">
                            pl-container-inset
                          </code>{" "}
                          aligns this text with the container edge.
                        </span>
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">Left column</span>
                      <span className="text-muted-foreground">anchor={leftAnchor}</span>
                    </>
                  )}
                </SplitContentItem>
                <SplitContentItem
                  anchor={rightAnchor}
                  className={cn(
                    "flex flex-col justify-center text-sm",
                    rightAnchor === "container" && "bg-muted/40 p-4 @md:p-6",
                    rightAnchor === "screen" && "bg-cover bg-center py-6 text-white @md:py-8",
                  )}
                  style={rightAnchor === "screen" ? screenColumnBg : undefined}
                >
                  {rightAnchor === "screen" ? (
                    <div className="pr-container-inset pl-4 text-white @md:pl-6">
                      <span className="font-medium text-white">Right column</span>
                      <span className="block text-white/90">
                        anchor={rightAnchor}
                        <span className="mt-1 block text-xs text-white/80">
                          Full-bleed background in the outer column;{" "}
                          <code className="rounded bg-black/25 px-1 py-0.5 font-mono text-[0.7rem] text-white">
                            pr-container-inset
                          </code>{" "}
                          aligns this text with the container edge.
                        </span>
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">Right column</span>
                      <span className="text-muted-foreground">anchor={rightAnchor}</span>
                    </>
                  )}
                </SplitContentItem>
              </SplitContent>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35} minSize={20} className="min-w-0">
          <div className="flex h-full items-center justify-center px-2 text-center text-sm text-muted-foreground">
            Drag the handle to resize the preview
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
