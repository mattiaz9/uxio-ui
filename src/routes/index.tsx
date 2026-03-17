import { createFileRoute, Link } from "@tanstack/react-router"

import { ArrowRightIcon, TerminalIcon, PaletteIcon, LayersIcon } from "lucide-react"
import { Logo } from "@/components/assets/logo"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  component: Home,
})

const components = [
  {
    name: "Button",
    description:
      "A drop-in replacement for the shadcn Button with additional sizes, refined styling, and support for both Base UI and Radix primitives.",
    category: "Overrides",
    docsPath: "/docs/overrides/base/button",
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
            <Logo className="h-4" />
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
              href="https://github.com/uxio-dev/uxio-ui"
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
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            Built on top of shadcn/ui
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Refined components for modern interfaces
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            An open-source component registry with some shadcn/ui extended components + some custom
            components.
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

      {/* Component showcase */}
      <section className="container py-20 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">Components</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            Every component ships as a registry entry you install into your own codebase — no
            runtime dependency, full ownership.
          </p>

          <div className="mt-14 space-y-10">
            {components.map((component) => (
              <div key={component.name} className="rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {component.category}
                    </span>
                    <h3 className="font-semibold">{component.name}</h3>
                  </div>
                  <Link
                    to="/docs/$"
                    params={{ _splat: component.docsPath.replace("/docs/", "") }}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Docs
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>

                <div className="space-y-8 p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {component.description}
                  </p>

                  {component.name === "Button" && (
                    <>
                      {/* Variants */}
                      <div className="space-y-3">
                        <p className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">
                          Variants
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button>Default</Button>
                          <Button variant="outline">Outline</Button>
                          <Button variant="secondary">Secondary</Button>
                          <Button variant="ghost">Ghost</Button>
                          <Button variant="destructive">Destructive</Button>
                          <Button variant="link">Link</Button>
                        </div>
                      </div>

                      {/* Sizes */}
                      <div className="space-y-3">
                        <p className="text-xs font-medium tracking-wider text-muted-foreground/70 uppercase">
                          Sizes
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="xs">Extra small</Button>
                          <Button size="sm">Small</Button>
                          <Button size="default">Default</Button>
                          <Button size="lg">Large</Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="container flex flex-col items-center py-20 text-center lg:py-28">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Start building</h2>
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
