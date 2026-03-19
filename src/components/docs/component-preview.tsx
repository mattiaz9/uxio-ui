"use client"

import { Suspense, useState, type ReactNode } from "react"

import { ChevronDownIcon } from "lucide-react"

import { examples } from "@/lib/examples"

function transformSource(source: string): string {
  return source
    .replace(/from\s*"\.\/ui\/button"/g, 'from "@/components/ui/button"')
    .replace(/from\s*"\.\/ui\/spinner"/g, 'from "@/components/ui/spinner"')
    .replace(/from\s*"\.\/ui\/alert"/g, 'from "@/components/ui/alert"')
    .replace(/from\s*"\.\/ui\/badge"/g, 'from "@/components/ui/badge"')
    .replace(/from\s*"\.\/ui\/card"/g, 'from "@/components/ui/card"')
    .replace(/from\s*"\.\/ui\/chart"/g, 'from "@/components/ui/chart"')
    .replace(/from\s*"\.\/ui\/command"/g, 'from "@/components/ui/command"')
    .replace(/from\s*"\.\/ui\/input"/g, 'from "@/components/ui/input"')
    .replace(/from\s*"\.\/ui\/input-group"/g, 'from "@/components/ui/input-group"')
    .replace(/from\s*"\.\/ui\/textarea"/g, 'from "@/components/ui/textarea"')
    .replace(/from\s*"\.\/ui\/popover"/g, 'from "@/components/ui/popover"')
    .replace(/from\s*"\.\/ui\/combobox"/g, 'from "@/components/ui/combobox"')
    .replace(/from\s*"\.\/ui\/dialog"/g, 'from "@/components/ui/dialog"')
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="absolute top-2 right-2 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
      onClick={() => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

export function ComponentPreview({
  name,
  children,
  className,
}: {
  name?: string
  children?: ReactNode
  className?: string
}) {
  const example = name ? examples[name] : undefined
  const [showCode, setShowCode] = useState(false)

  const displaySource = example ? transformSource(example.source) : ""

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-border">
      <div
        className={
          "flex min-h-[200px] flex-col items-center justify-center gap-4 bg-muted/30 p-8 " +
          (className ?? "")
        }
      >
        {example ? (
          <Suspense fallback={null}>
            <example.component />
          </Suspense>
        ) : (
          children
        )}
      </div>
      {example && (
        <>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex w-full items-center gap-1.5 border-t border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <ChevronDownIcon
              className={`size-3.5 transition-transform ${showCode ? "rotate-180" : ""}`}
            />
            {showCode ? "Hide Code" : "View Code"}
          </button>
          {showCode && (
            <div className="border-t border-border bg-zinc-950 dark:bg-zinc-900">
              <div className="relative">
                <CopyButton code={displaySource} />
                <pre className="overflow-auto p-4 text-[13px] leading-relaxed text-zinc-100">
                  <code>{displaySource}</code>
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
