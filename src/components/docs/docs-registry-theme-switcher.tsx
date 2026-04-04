"use client"

import { useState, type ComponentType, type SVGProps } from "react"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import {
  LyraThemeIcon,
  LumaThemeIcon,
  MaiaThemeIcon,
  MiraThemeIcon,
  NovaThemeIcon,
  VegaThemeIcon,
} from "@/components/docs/docs-registry-theme-icons"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DOCS_REGISTRY_THEMES,
  type DocsRegistryThemeId,
  setDocsRegistryTheme,
  useDocsRegistryTheme,
} from "@/lib/docs-registry-theme-client"
import { cn } from "@/lib/utils"

type ThemeIcon = ComponentType<SVGProps<SVGSVGElement>>

/** Active theme: blue/cyan ring + glyph only (no fill). */
const iconShellSelected = "bg-transparent text-cyan-600 ring-1 ring-inset ring-cyan-500/55"

/** Other themes: muted ring + glyph only (no fill). */
const iconShellMuted = "bg-transparent text-fd-muted-foreground ring-1 ring-inset ring-fd-border/70"

const THEME_UI: Record<DocsRegistryThemeId, { title: string; Icon: ThemeIcon }> = {
  vega: { title: "Vega", Icon: VegaThemeIcon },
  nova: { title: "Nova", Icon: NovaThemeIcon },
  maia: { title: "Maia", Icon: MaiaThemeIcon },
  lyra: { title: "Lyra", Icon: LyraThemeIcon },
  mira: { title: "Mira", Icon: MiraThemeIcon },
  luma: { title: "Luma", Icon: LumaThemeIcon },
}

export function DocsRegistryThemeSwitcher({ className }: { className?: string }) {
  const theme = useDocsRegistryTheme()
  const [open, setOpen] = useState(false)
  const current = THEME_UI[theme]
  const CurrentIcon = current.Icon

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-fd-border bg-fd-secondary/50 px-2 py-1.5 text-start transition-colors",
            "hover:bg-fd-accent/50 focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none",
            open && "bg-fd-accent/40",
          )}
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-md",
              iconShellSelected,
            )}
            aria-hidden
          >
            <CurrentIcon className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-fd-foreground">
            {current.title}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-fd-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-(--radix-popper-anchor-width) gap-0 p-0 text-[0.8125rem] shadow-md ring-1 ring-fd-border"
        >
          <PopoverHeader className="sr-only">
            <PopoverTitle>Registry theme</PopoverTitle>
          </PopoverHeader>
          <Command shouldFilter={false} className="rounded-lg! p-0.5">
            <CommandList className="max-h-64 scroll-py-0.5">
              <CommandGroup className="p-0">
                {DOCS_REGISTRY_THEMES.map((id) => {
                  const opt = THEME_UI[id]
                  const selected = theme === id
                  const OptIcon = opt.Icon
                  return (
                    <CommandItem
                      key={id}
                      value={id}
                      keywords={[opt.title, id]}
                      onSelect={() => {
                        setDocsRegistryTheme(id)
                        setOpen(false)
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border-0 px-1.5 py-1.5",
                        "[&>svg:last-child]:hidden",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md",
                          selected ? iconShellSelected : iconShellMuted,
                        )}
                        aria-hidden
                      >
                        <OptIcon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-fd-foreground">
                        {opt.title}
                      </span>
                      <CheckIcon
                        className={cn(
                          "size-3.5 shrink-0 text-cyan-600",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
