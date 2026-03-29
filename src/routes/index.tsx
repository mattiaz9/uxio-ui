import { createFileRoute, Link } from "@tanstack/react-router"

import {
  ArrowRightIcon,
  CalendarClockIcon,
  LayoutTemplateIcon,
  LayersIcon,
  PaletteIcon,
  PuzzleIcon,
  TerminalIcon,
} from "lucide-react"
import { Logo } from "@/components/assets/logo"

import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { ReactNode } from "react"

export const Route = createFileRoute("/")({
  component: Home,
})

type RegistryCategory = "Overrides" | "Inputs" | "Layout" | "Layers"

type RegistryComponentItem = {
  title: string
  description: string
  category: RegistryCategory
  /** Path under `/docs/` (TanStack `_splat`, no leading slash). */
  docsSplat: string
}

/** Mirrors `registry/uxio/registry.config.json` UI items plus registry-only pieces that have docs (input-group, textarea). Sidebar links to the bundle overview. */
const registryComponents: RegistryComponentItem[] = [
  // Overrides
  {
    title: "Alert Dialog",
    description: "Alert dialog with content background using bg-popover instead of bg-background.",
    category: "Overrides",
    docsSplat: "overrides/base/alert-dialog",
  },
  {
    title: "Alert",
    description: "Extended alert component with semantic color variants (info, success, warning).",
    category: "Overrides",
    docsSplat: "overrides/base/alert",
  },
  {
    title: "Badge",
    description: "Extended badge component with semantic color variants (info, success, warning).",
    category: "Overrides",
    docsSplat: "overrides/base/badge",
  },
  {
    title: "Button",
    description: "Extended button component with extra variants and loading state support.",
    category: "Overrides",
    docsSplat: "overrides/base/button",
  },
  {
    title: "Card",
    description: "Card component with destructive variant.",
    category: "Overrides",
    docsSplat: "overrides/base/card",
  },
  {
    title: "Chart",
    description: "Same code as the original, but with some fixes for stricter linting rules.",
    category: "Overrides",
    docsSplat: "overrides/base/chart",
  },
  {
    title: "Combobox",
    description:
      "Combobox built from Popover, Command, and Button. Same logic as Select with search.",
    category: "Overrides",
    docsSplat: "overrides/base/combobox",
  },
  {
    title: "Command",
    description:
      "Command palette component. Same as the original shadcn command with lucide-react icons.",
    category: "Overrides",
    docsSplat: "overrides/base/command",
  },
  {
    title: "Dialog",
    description: "Dialog with content background using bg-popover instead of bg-background.",
    category: "Overrides",
    docsSplat: "overrides/base/dialog",
  },
  {
    title: "Drawer",
    description: "Drawer with content background using bg-popover instead of bg-background.",
    category: "Overrides",
    docsSplat: "overrides/base/drawer",
  },
  {
    title: "Form (Tanstack)",
    description:
      "Form element with TanStack Form context: prevents default submit, calls `form.handleSubmit()`, and exposes `useFormContext` for nested components.",
    category: "Overrides",
    docsSplat: "overrides/base/form",
  },
  {
    title: "Input Group",
    description:
      "Grouped input primitives with addons and aligned controls (used by Command and Combobox).",
    category: "Overrides",
    docsSplat: "overrides/base/input-group",
  },
  {
    title: "Input",
    description:
      "Extended input component with size variants (xs, sm, default, lg) matching button dimensions.",
    category: "Overrides",
    docsSplat: "overrides/base/input",
  },
  {
    title: "Item",
    description:
      "Item list primitives with ItemGroup layout variants: default spacing or grouped stacked items.",
    category: "Overrides",
    docsSplat: "overrides/base/item",
  },
  {
    title: "Popover",
    description: "Popover with content background using bg-popover instead of bg-background.",
    category: "Overrides",
    docsSplat: "overrides/base/popover",
  },
  {
    title: "Scroll Area",
    description:
      "Scroll area with a scrollbar prop to show vertical, horizontal, or both scrollbars.",
    category: "Overrides",
    docsSplat: "overrides/base/scroll-area",
  },
  {
    title: "Sheet",
    description: "Sheet with content background using bg-popover instead of bg-background.",
    category: "Overrides",
    docsSplat: "overrides/base/sheet",
  },
  {
    title: "Sidebar",
    description:
      "Collapsible sidebar with mobile sheet, keyboard shortcut, and menu primitives (see bundle overview).",
    category: "Overrides",
    docsSplat: "bundle",
  },
  {
    title: "Skeleton",
    description: "Skeleton with a shimmer loading animation instead of pulse.",
    category: "Overrides",
    docsSplat: "overrides/base/skeleton",
  },
  {
    title: "Spinner",
    description: "Tick-based spinner. A redesign of the original shadcn spinner.",
    category: "Overrides",
    docsSplat: "overrides/base/spinner",
  },
  {
    title: "Textarea",
    description: "Same as the original shadcn textarea component.",
    category: "Overrides",
    docsSplat: "overrides/base/textarea",
  },
  {
    title: "Tooltip",
    description:
      "Tooltip primitives plus AutoTooltip, which shows the tooltip only when the trigger content is truncated (unless mode is always).",
    category: "Overrides",
    docsSplat: "overrides/base/tooltip",
  },
  // Inputs
  {
    title: "Input DateTime",
    description:
      "Segmented date, time, or datetime field with calendar popover and hidden string value for forms.",
    category: "Inputs",
    docsSplat: "inputs/base/input-datetime",
  },
  {
    title: "Input Duration",
    description:
      "Segmented duration in total seconds with carry between units, RTL digit entry, and hidden seconds field for forms.",
    category: "Inputs",
    docsSplat: "inputs/base/input-duration",
  },
  {
    title: "Input Fraction",
    description:
      "Segmented numerator and denominator with fixed separator, compact fraction string, and hidden field for forms.",
    category: "Inputs",
    docsSplat: "inputs/base/input-fraction",
  },
  {
    title: "Input Number",
    description:
      "Numeric input with step controls, filtered typing, and separate text and committed-value callbacks.",
    category: "Inputs",
    docsSplat: "inputs/base/input-number",
  },
  {
    title: "Input Currency",
    description:
      "Money field with currency symbol addon, plain typing, Intl display on commit, and normalized decimal strings.",
    category: "Inputs",
    docsSplat: "inputs/base/input-currency",
  },
  {
    title: "Input Password",
    description:
      "Password input with the same API as Input, plus a suffix control to reveal or mask the value.",
    category: "Inputs",
    docsSplat: "inputs/base/input-password",
  },
  // Layout
  {
    title: "Split Content",
    description:
      "Two-column layout on a 6+2 gutter grid: columns align to the container or screen edge, with responsive stacking.",
    category: "Layout",
    docsSplat: "layout/base/split-content",
  },
  {
    title: "Vercel Sidebar",
    description:
      "Sidebar with drill-down panels: root nav swaps to sub-links with back + title; header/footer stay fixed.",
    category: "Layout",
    docsSplat: "layout/base/vercel-sidebar",
  },
  // Layers
  {
    title: "Alerter",
    description: "Imperative notice dialog (single OK action), styled like a browser alert.",
    category: "Layers",
    docsSplat: "layers/base/alerter",
  },
  {
    title: "Confirmer",
    description:
      "Imperative confirmation dialog with async action support, loading state, and inline error display.",
    category: "Layers",
    docsSplat: "layers/base/confirmer",
  },
]

const COMPONENT_SECTIONS: {
  category: RegistryCategory
  label: string
  blurb: string
  icon: ReactNode
}[] = [
  {
    category: "Overrides",
    label: "Overrides",
    blurb: "Enhanced shadcn primitives and composed controls — same APIs, refined defaults.",
    icon: <PuzzleIcon className="size-5" />,
  },
  {
    category: "Inputs",
    label: "Inputs",
    blurb:
      "Composed field controls that extend primitives with calendars, groups, and structured typing.",
    icon: <CalendarClockIcon className="size-5" />,
  },
  {
    category: "Layout",
    label: "Layout",
    blurb: "Page structure and navigation patterns built on registry primitives.",
    icon: <LayoutTemplateIcon className="size-5" />,
  },
  {
    category: "Layers",
    label: "Layers",
    blurb: "Imperative dialogs for confirm/alert flows on top of alert-dialog.",
    icon: <LayersIcon className="size-5" />,
  },
]

const styles = ["Lyra", "Maia", "Mira", "Nova", "Vega"]

function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="text-sm font-bold tracking-tight">
            <Logo className="h-3.5" />
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/docs/$"
              params={{ _splat: "" }}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Docs
            </Link>
            <a
              href="https://github.com/mattiaz9/uxio-ui"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,var(--color-primary)/6%,transparent)]" />
        <div className="container flex flex-col items-center py-24 text-center sm:py-32 lg:py-40">
          <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Refined shadcn/ui components for your next project
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Refined shadcn/ui components compatible with Radix, Base and the styles Lyra, Maia,
            Mira, Nova, Vega. Plus few extra components that makes your life easier!
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/docs/$"
              params={{ _splat: "" }}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Browse docs
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <a
              href="https://github.com/uxio-dev/uxio-ui"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              GitHub
            </a>
          </div>
          <div className="mt-8 w-full max-w-md">
            <pre className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground backdrop-blur">
              <TerminalIcon className="size-4 shrink-0 text-muted-foreground/60" />
              <code>npx shadcn@latest add @uxio/button</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="container grid gap-px sm:grid-cols-3">
          {[
            {
              icon: <LayersIcon className="size-5" />,
              title: "Drop-in overrides",
              desc: "Enhanced shadcn components that keep the same API — swap in better defaults without refactoring.",
            },
            {
              icon: <PaletteIcon className="size-5" />,
              title: "5 style themes",
              desc: `Ship with ${styles.join(", ")} — curated themes that map to your components.json style.`,
            },
            {
              icon: <TerminalIcon className="size-5" />,
              title: "One-command install",
              desc: "Add any component via the shadcn CLI. Base UI or Radix variant is resolved automatically.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 border-b border-border px-1 py-10 last:border-b-0 sm:border-r sm:border-b-0 sm:px-8 sm:last:border-r-0"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Components */}
      <section className="border-b border-border">
        <div className="container py-20 lg:py-28">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Components
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            Every component ships as a registry entry you install into your own codebase — no
            runtime dependency, full ownership.
          </p>

          {COMPONENT_SECTIONS.map((section, sectionIndex) => {
            const items = registryComponents.filter((c) => c.category === section.category)
            const n = items.length
            return (
              <div
                key={section.category}
                className={cn(sectionIndex === 0 ? "mt-14" : "mt-16 lg:mt-20")}
              >
                <div className="mx-auto mb-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{section.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {section.blurb}
                    </p>
                  </div>
                </div>

                <div className="grid gap-0 overflow-hidden rounded-xl border border-border bg-transparent sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((c, i) => {
                    const isLastRowSm = Math.floor(i / 2) === Math.floor((n - 1) / 2)
                    const isLastRowLg = Math.floor(i / 3) === Math.floor((n - 1) / 3)
                    return (
                      <Link
                        key={c.docsSplat + c.title}
                        to="/docs/$"
                        params={{ _splat: c.docsSplat }}
                        className={cn(
                          "group flex flex-col gap-3 border-b border-border bg-transparent p-6 sm:p-8",
                          "max-sm:last:border-b-0",
                          isLastRowSm && "sm:border-b-0",
                          !isLastRowLg && "lg:border-b",
                          isLastRowLg && "lg:border-b-0",
                          (i + 1) % 2 !== 0 && "sm:border-r",
                          (i + 1) % 3 !== 0 && "lg:border-r",
                        )}
                      >
                        <h4 className="text-sm font-semibold">{c.title}</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {c.description}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-primary group-hover:underline">
                          Docs
                          <ArrowRightIcon className="size-3.5" />
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Install CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="container flex flex-col items-center py-20 text-center lg:py-28">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Start building
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Configure your registry once, then add any component with a single command.
          </p>
          <pre className="mt-8 w-full max-w-lg overflow-x-auto rounded-lg border border-border bg-background px-5 py-4 text-left text-sm">
            <code className="text-muted-foreground">
              {`// components.json
{
  "registries": {
    "@uxio": "https://ui.uxio.dev/r/styles/{style}/{name}.json"
  }
}`}
            </code>
          </pre>
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className={cn(buttonVariants({ size: "lg" }), "mt-8")}
          >
            Read the docs
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} uxio.dev. All rights reserved.</p>
          <p>
            Crafted by{" "}
            <a
              href="https://x.com/mattiaz101"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              @mattiaz101
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
