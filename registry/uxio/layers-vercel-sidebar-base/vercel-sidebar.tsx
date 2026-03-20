"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/uxio/overrides-command-base/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/uxio/overrides-popover-base/popover"
import {
  filterVercelSidebarItems,
  type VercelSidebarSearchItem,
} from "./vercel-sidebar-search"
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/registry/uxio/overrides-sidebar-base/sidebar"

type VercelSidebarNavContextValue = {
  activePanel: string
  setActivePanel: (id: string) => void
  rootPanelId: string
}

const VercelSidebarNavContext = React.createContext<VercelSidebarNavContextValue | null>(null)

function useVercelSidebarNav() {
  const ctx = React.useContext(VercelSidebarNavContext)
  if (!ctx) {
    throw new Error("useVercelSidebarNav must be used within VercelSidebarNav.")
  }
  return ctx
}

function useOptionalVercelSidebarNav() {
  return React.useContext(VercelSidebarNavContext)
}

type VercelSidebarNavProviderProps = {
  /** Initial panel when uncontrolled; match server render for SSR (e.g. from route). */
  defaultPanel?: string
  /** Panel id treated as the root rail (back target). */
  rootPanelId?: string
  /** Controlled active panel. When set, `onPanelChange` is called on navigation. */
  panel?: string
  onPanelChange?: (panelId: string) => void
  children?: React.ReactNode
}

function VercelSidebarNavProvider({
  defaultPanel = "root",
  rootPanelId = "root",
  panel: panelProp,
  onPanelChange,
  children,
}: VercelSidebarNavProviderProps) {
  const isControlled = panelProp !== undefined
  const [internalPanel, setInternalPanel] = React.useState(defaultPanel)
  const activePanel = isControlled ? panelProp : internalPanel

  const setActivePanel = React.useCallback(
    (id: string) => {
      if (isControlled) {
        onPanelChange?.(id)
      } else {
        setInternalPanel(id)
      }
    },
    [isControlled, onPanelChange],
  )

  const value = React.useMemo(
    () => ({ activePanel, setActivePanel, rootPanelId }),
    [activePanel, setActivePanel, rootPanelId],
  )

  return <VercelSidebarNavContext.Provider value={value}>{children}</VercelSidebarNavContext.Provider>
}

type VercelSidebarNavProps = Omit<React.ComponentProps<typeof SidebarContent>, "children"> & {
  children?: React.ReactNode
}

function VercelSidebarNav({ className, children, ...props }: VercelSidebarNavProps) {
  useVercelSidebarNav()

  return (
    <SidebarContent className={cn(className)} {...props}>
      <div className="relative min-h-0 w-full flex-1">{children}</div>
    </SidebarContent>
  )
}

const panelTransition = {
  duration: 0.24,
  ease: [0.32, 0.72, 0, 1] as const,
}

type VercelSidebarPanelProps = React.ComponentProps<typeof motion.div> & {
  panelId: string
}

function VercelSidebarPanel({ panelId, className, children, ...props }: VercelSidebarPanelProps) {
  const { activePanel, rootPanelId } = useVercelSidebarNav()
  const active = activePanel === panelId
  const isRoot = panelId === rootPanelId

  return (
    <motion.div
      data-slot="vercel-sidebar-panel"
      data-panel={panelId}
      data-state={active ? "active" : "inactive"}
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        x: active ? 0 : isRoot ? -18 : 18,
        zIndex: active ? 1 : 0,
        pointerEvents: active ? "auto" : "none",
      }}
      transition={panelTransition}
      className={cn(
        "absolute inset-0 flex min-h-0 flex-col gap-2 overflow-auto overflow-x-hidden",
        className,
      )}
      aria-hidden={!active}
      inert={!active ? true : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type VercelSidebarBackProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  onBack?: () => void
}

function VercelSidebarBack({ title, className, onBack, ...props }: VercelSidebarBackProps) {
  const { setActivePanel, rootPanelId } = useVercelSidebarNav()

  return (
    <div
      data-slot="vercel-sidebar-back"
      className={cn("shrink-0 border-b border-sidebar-border px-2 pb-2", className)}
      {...props}
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            type="button"
            onClick={() => (onBack ? onBack() : setActivePanel(rootPanelId))}
            aria-label="Back"
          >
            <ChevronLeft className="size-4 shrink-0" />
            <span className="min-w-0 truncate font-medium">{title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  )
}

type VercelSidebarSearchPopoverProps = {
  items: readonly VercelSidebarSearchItem[]
  /** Must be a single element that accepts a ref (e.g. the search row). */
  children: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * When set, called on every selection; default panel navigation is skipped.
   * When omitted, selecting an item runs `item.onSelect` or `setActivePanel(item.panelId)` when inside `VercelSidebarNav`.
   */
  onSelect?: (item: VercelSidebarSearchItem) => void
  title?: string
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  align?: React.ComponentProps<typeof PopoverContent>["align"]
  sideOffset?: React.ComponentProps<typeof PopoverContent>["sideOffset"]
  className?: string
}

function VercelSidebarSearchPopover({
  items,
  children,
  open,
  onOpenChange,
  onSelect,
  title = "Search navigation",
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: VercelSidebarSearchPopoverProps) {
  const nav = useOptionalVercelSidebarNav()
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const filtered = React.useMemo(
    () => filterVercelSidebarItems(items, search),
    [items, search],
  )

  const handlePick = React.useCallback(
    (item: VercelSidebarSearchItem) => {
      if (onSelect) {
        onSelect(item)
      } else {
        item.onSelect?.()
        if (!item.onSelect && item.panelId && nav) {
          nav.setActivePanel(item.panelId)
        }
      }
      onOpenChange?.(false)
    },
    [nav, onOpenChange, onSelect],
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={children} />
      <PopoverContent
        data-slot="vercel-sidebar-search-popover"
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "cn-vercel-sidebar-search-popover z-50 flex w-[var(--radix-popover-trigger-width,min(20rem,calc(100vw-2rem)))] max-w-[min(24rem,calc(100vw-1rem))] flex-col overflow-hidden border border-border bg-popover p-0 text-popover-foreground shadow-lg",
          className,
        )}
      >
        <p className="sr-only">{title}</p>
        <Command shouldFilter={false} loop className="bg-transparent">
          <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder="Find…"
                className="h-9 border-0"
              />
            </div>
            <kbd className="hidden h-5 shrink-0 items-center rounded border border-border/80 bg-muted/50 px-1.5 font-mono text-[10px] leading-none text-muted-foreground sm:inline-flex">
              Esc
            </kbd>
          </div>
          <CommandList className="max-h-64 p-1">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results.
            </CommandEmpty>
            {filtered.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                keywords={[item.title, item.subtitle, ...(item.keywords ?? [])].filter(
                  (x): x is string => typeof x === "string" && x.length > 0,
                )}
                onSelect={() => handlePick(item)}
                className="[&>svg:last-child]:hidden"
              >
                <div className="flex w-full min-w-0 flex-col gap-0.5 py-0.5">
                  <div className="flex min-w-0 items-center gap-2">
                    {item.icon ? (
                      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="min-w-0 truncate font-medium">{item.title}</span>
                  </div>
                  {item.subtitle ? (
                    <span className="truncate pl-6 text-xs text-muted-foreground">{item.subtitle}</span>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export {
  VercelSidebarBack,
  VercelSidebarNav,
  VercelSidebarNavProvider,
  VercelSidebarPanel,
  VercelSidebarSearchPopover,
  useOptionalVercelSidebarNav,
  useVercelSidebarNav,
}

export { filterVercelSidebarItems, type VercelSidebarSearchItem } from "./vercel-sidebar-search"

export * from "@/registry/uxio/overrides-sidebar-base/sidebar"
