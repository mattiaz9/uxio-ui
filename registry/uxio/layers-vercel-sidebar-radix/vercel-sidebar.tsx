"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/registry/uxio/overrides-sidebar-radix/sidebar"

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
        <div className="relative min-h-0 w-full flex-1">{children}</div>
      </SidebarContent>
    </VercelSidebarNavContext.Provider>
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

export {
  VercelSidebarBack,
  VercelSidebarNav,
  VercelSidebarPanel,
  useVercelSidebarNav,
}

export * from "@/registry/uxio/overrides-sidebar-radix/sidebar"
