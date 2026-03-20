"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"
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

type VercelSidebarNavProps = Omit<React.ComponentProps<typeof SidebarContent>, "children"> & {
  /** Initial panel when uncontrolled; match server render for SSR (e.g. from route). */
  defaultPanel?: string
  /** Panel id treated as the root rail (back target). */
  rootPanelId?: string
  /** Controlled active panel. When set, `onPanelChange` is called on navigation. */
  panel?: string
  onPanelChange?: (panelId: string) => void
  children?: React.ReactNode
}

function VercelSidebarNav({
  defaultPanel = "root",
  rootPanelId = "root",
  panel: panelProp,
  onPanelChange,
  className,
  children,
  ...props
}: VercelSidebarNavProps) {
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

  return (
    <VercelSidebarNavContext.Provider value={value}>
      <SidebarContent className={cn(className)} {...props}>
        {children}
      </SidebarContent>
    </VercelSidebarNavContext.Provider>
  )
}

type VercelSidebarPanelProps = React.ComponentProps<"div"> & {
  panelId: string
}

function VercelSidebarPanel({ panelId, className, children, ...props }: VercelSidebarPanelProps) {
  const { activePanel } = useVercelSidebarNav()
  const active = activePanel === panelId

  return (
    <div
      data-slot="vercel-sidebar-panel"
      data-panel={panelId}
      data-state={active ? "active" : "inactive"}
      hidden={!active}
      className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}
      {...props}
    >
      {children}
    </div>
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
      className={cn("flex shrink-0 items-center gap-2 border-b border-sidebar-border px-2 pb-2", className)}
      {...props}
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            type="button"
            size="sm"
            className="size-8 p-0"
            onClick={() => (onBack ? onBack() : setActivePanel(rootPanelId))}
            aria-label="Back"
          >
            <ChevronLeft className="size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground">{title}</span>
    </div>
  )
}

export {
  VercelSidebarBack,
  VercelSidebarNav,
  VercelSidebarPanel,
  useVercelSidebarNav,
}

export * from "@/registry/uxio/overrides-sidebar-base/sidebar"
