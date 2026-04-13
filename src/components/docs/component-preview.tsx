"use client"

import { Suspense, useEffect, useState } from "react"

import { ChevronDownIcon } from "lucide-react"

import { examples } from "@/lib/examples"

import type { ReactNode } from "react"

function PreviewCode({ code }: { code: string }) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { codeToHtml } = await import("shiki/bundle/web")
      const out = await codeToHtml(code, {
        lang: "tsx",
        theme: "github-dark",
      })
      if (!cancelled) setHtml(out)
    })()
    return () => {
      cancelled = true
    }
  }, [code])

  if (!html) {
    return (
      <pre className="overflow-auto p-4 text-[13px] leading-relaxed text-zinc-100">
        <code>{code}</code>
      </pre>
    )
  }

  return (
    <div
      className="preview-code-shiki overflow-auto p-4 text-[13px] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function transformSource(source: string): string {
  return source
    .replace(/from\s*"\.\/ui\/button"/g, 'from "@/components/ui/button"')
    .replace(/from\s*"\.\/ui\/spinner"/g, 'from "@/components/ui/spinner"')
    .replace(/from\s*"\.\/ui\/alert"/g, 'from "@/components/ui/alert"')
    .replace(/from\s*"\.\/ui\/accordion"/g, 'from "@/components/ui/accordion"')
    .replace(/from\s*"\.\/ui\/badge"/g, 'from "@/components/ui/badge"')
    .replace(/from\s*"\.\/ui\/card"/g, 'from "@/components/ui/card"')
    .replace(/from\s*"\.\/ui\/chart"/g, 'from "@/components/ui/chart"')
    .replace(/from\s*"\.\/ui\/command"/g, 'from "@/components/ui/command"')
    .replace(/from\s*"\.\/ui\/input"/g, 'from "@/components/ui/input"')
    .replace(/from\s*"\.\/ui\/input-group"/g, 'from "@/components/ui/input-group"')
    .replace(/from\s*"\.\/ui\/input-datetime"/g, 'from "@/components/ui/input-datetime"')
    .replace(/from\s*"\.\/ui\/input-duration"/g, 'from "@/components/ui/input-duration"')
    .replace(/from\s*"\.\/ui\/input-fraction"/g, 'from "@/components/ui/input-fraction"')
    .replace(/from\s*"\.\/ui\/input-number"/g, 'from "@/components/ui/input-number"')
    .replace(/from\s*"\.\/ui\/input-currency"/g, 'from "@/components/ui/input-currency"')
    .replace(/from\s*"\.\/ui\/input-password"/g, 'from "@/components/ui/input-password"')
    .replace(/from\s*"\.\/ui\/calendar"/g, 'from "@/components/ui/calendar"')
    .replace(/from\s*"\.\/ui\/textarea"/g, 'from "@/components/ui/textarea"')
    .replace(/from\s*"\.\/ui\/combobox"/g, 'from "@/components/ui/combobox"')
    .replace(/from\s*"\.\/ui\/alert-dialog"/g, 'from "@/components/ui/alert-dialog"')
    .replace(/from\s*"\.\/ui\/dialog"/g, 'from "@/components/ui/dialog"')
    .replace(/from\s*"\.\/ui\/drawer"/g, 'from "@/components/ui/drawer"')
    .replace(/from\s*"\.\/ui\/form"/g, 'from "@/components/ui/form"')
    .replace(/from\s*"\.\/ui\/sheet"/g, 'from "@/components/ui/sheet"')
    .replace(/from\s*"\.\/ui\/item"/g, 'from "@/components/ui/item"')
    .replace(/from\s*"\.\/ui\/alerter"/g, 'from "@/components/ui/alerter"')
    .replace(/from\s*"\.\/ui\/confirmer"/g, 'from "@/components/ui/confirmer"')
    .replace(/from\s*"\.\/ui\/scroll-area"/g, 'from "@/components/ui/scroll-area"')
    .replace(/from\s*"\.\/ui\/skeleton"/g, 'from "@/components/ui/skeleton"')
    .replace(/from\s*"\.\/ui\/tooltip"/g, 'from "@/components/ui/tooltip"')
    .replace(/from\s*"\.\/ui\/split-content"/g, 'from "@/components/ui/split-content"')
    .replace(/from\s*"\.\/ui\/vercel-sidebar"/g, 'from "@/components/ui/vercel-sidebar"')
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="absolute top-2 right-2 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
      onClick={() => {
        void navigator.clipboard.writeText(code)
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
                <PreviewCode code={displaySource} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
