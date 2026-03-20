"use client"

import * as React from "react"
import type { ComponentType } from "react"
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Box,
  ChevronRight,
  ChevronsUpDown,
  Cloud,
  FileStack,
  Flag,
  FolderKanban,
  Globe,
  ImageIcon,
  LayoutGrid,
  Layers,
  MoreHorizontal,
  Network,
  Rocket,
  Search,
  Server,
  Settings,
  Shield,
  Sparkles,
  SquareTerminal,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  VercelSidebarBack,
  VercelSidebarNav,
  VercelSidebarNavProvider,
  VercelSidebarPanel,
  VercelSidebarSearchPopover,
  useVercelSidebarNav,
  type VercelSidebarSearchItem,
} from "./ui/vercel-sidebar"

const demoProject = "mattiaz's projects"

const demoSidebarSearchItems: VercelSidebarSearchItem[] = [
  { id: "r-projects", title: "Projects", subtitle: demoProject, panelId: "root", icon: <FolderKanban className="size-4" /> },
  { id: "r-deployments", title: "Deployments", subtitle: demoProject, panelId: "root", icon: <Rocket className="size-4" /> },
  { id: "r-logs", title: "Logs", subtitle: demoProject, panelId: "root", icon: <SquareTerminal className="size-4" /> },
  { id: "r-analytics", title: "Analytics", subtitle: demoProject, panelId: "root", icon: <BarChart3 className="size-4" /> },
  { id: "r-speed", title: "Speed Insights", subtitle: demoProject, panelId: "root", icon: <Activity className="size-4" /> },
  { id: "r-obs", title: "Observability", subtitle: demoProject, panelId: "observability", icon: <LayoutGrid className="size-4" /> },
  { id: "r-firewall", title: "Firewall", subtitle: demoProject, panelId: "root", icon: <Shield className="size-4" /> },
  { id: "r-cdn", title: "CDN", subtitle: demoProject, panelId: "root", icon: <Cloud className="size-4" /> },
  { id: "r-domains", title: "Domains", subtitle: demoProject, panelId: "root", icon: <Globe className="size-4" /> },
  { id: "r-int", title: "Integrations", subtitle: demoProject, panelId: "root", icon: <Layers className="size-4" /> },
  { id: "r-storage", title: "Storage", subtitle: demoProject, panelId: "root", icon: <Box className="size-4" /> },
  { id: "r-flags", title: "Flags", subtitle: demoProject, panelId: "root", icon: <Flag className="size-4" /> },
  { id: "r-agent", title: "Agent", subtitle: demoProject, panelId: "root", icon: <Bot className="size-4" /> },
  { id: "r-aigw", title: "AI Gateway", subtitle: demoProject, panelId: "root", icon: <Sparkles className="size-4" /> },
  { id: "r-sand", title: "Sandboxes", subtitle: demoProject, panelId: "root", icon: <Server className="size-4" /> },
  { id: "r-usage", title: "Usage", subtitle: demoProject, panelId: "root", icon: <BarChart3 className="size-4" /> },
  { id: "r-support", title: "Support", subtitle: demoProject, panelId: "root", icon: <Network className="size-4" /> },
  { id: "r-settings", title: "Settings", subtitle: demoProject, panelId: "root", icon: <Settings className="size-4" /> },
  { id: "o-overview", title: "Overview", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <LayoutGrid className="size-4" /> },
  { id: "o-query", title: "Query", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <Search className="size-4" /> },
  { id: "o-notebooks", title: "Notebooks", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <FileStack className="size-4" /> },
  { id: "o-alerts", title: "Alerts", subtitle: `${demoProject} / Observability`, keywords: ["beta"], panelId: "observability", icon: <Bell className="size-4" /> },
  { id: "o-fn", title: "Functions", subtitle: `${demoProject} / Observability`, keywords: ["compute"], panelId: "observability", icon: <Zap className="size-4" /> },
  { id: "o-api", title: "External APIs", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <Globe className="size-4" /> },
  { id: "o-mw", title: "Middleware", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <Layers className="size-4" /> },
  { id: "o-wf", title: "Workflows", subtitle: `${demoProject} / Observability`, keywords: ["beta"], panelId: "observability", icon: <Activity className="size-4" /> },
  { id: "o-edge", title: "Edge Requests", subtitle: `${demoProject} / Observability`, keywords: ["cdn", "edge"], panelId: "observability", icon: <Globe className="size-4" /> },
  { id: "o-fdt", title: "Fast Data Transfer", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <Cloud className="size-4" /> },
  { id: "o-img", title: "Image Optimization", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <ImageIcon className="size-4" /> },
  { id: "o-isr", title: "ISR", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <Rocket className="size-4" /> },
  { id: "o-rewrite", title: "External Rewrites", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <Network className="size-4" /> },
  { id: "o-mf", title: "Microfrontends", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <LayoutGrid className="size-4" /> },
  { id: "o-ai", title: "AI", subtitle: `${demoProject} / Observability`, keywords: ["services"], panelId: "observability", icon: <Sparkles className="size-4" /> },
  { id: "o-blob", title: "Blob", subtitle: `${demoProject} / Observability`, panelId: "observability", icon: <Box className="size-4" /> },
  { id: "o-q", title: "Queues", subtitle: `${demoProject} / Observability`, keywords: ["beta"], panelId: "observability", icon: <Server className="size-4" /> },
]

function BetaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md border border-blue-500/35 bg-blue-500/10 px-1.5 py-0.5 font-medium text-[10px] text-blue-400 uppercase tracking-wide",
        className,
      )}
    >
      Beta
    </span>
  )
}

function SubNavItem({
  icon: Icon,
  label,
  beta,
  active,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  beta?: boolean
  active?: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton type="button" isActive={active} className="justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 opacity-70" />
          <span className="truncate">{label}</span>
        </span>
        {beta ? <BetaBadge /> : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function RootNav() {
  const { setActivePanel } = useVercelSidebarNav()

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="button" isActive>
                <FolderKanban className="size-4" />
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Rocket className="size-4" />
                <span>Deployments</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <SquareTerminal className="size-4" />
                <span>Logs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <BarChart3 className="size-4" />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Activity className="size-4" />
                <span>Speed Insights</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                className="justify-between"
                onClick={() => setActivePanel("observability")}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="size-4" />
                  <span>Observability</span>
                </span>
                <ChevronRight className="size-4 shrink-0 opacity-50" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Shield className="size-4" />
                <span>Firewall</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Cloud className="size-4" />
                <span>CDN</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator className="mx-2" />
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Globe className="size-4" />
                <span>Domains</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Layers className="size-4" />
                <span>Integrations</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Box className="size-4" />
                <span>Storage</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Flag className="size-4" />
                <span>Flags</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button" className="justify-between">
                <span className="flex items-center gap-2">
                  <Bot className="size-4" />
                  <span>Agent</span>
                </span>
                <ChevronRight className="size-4 shrink-0 opacity-50" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button" className="justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <span>AI Gateway</span>
                </span>
                <ChevronRight className="size-4 shrink-0 opacity-50" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Server className="size-4" />
                <span>Sandboxes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator className="mx-2" />
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <BarChart3 className="size-4" />
                <span>Usage</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button">
                <Network className="size-4" />
                <span>Support</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton type="button" className="justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="size-4" />
                  <span>Settings</span>
                </span>
                <ChevronRight className="size-4 shrink-0 opacity-50" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

function ObservabilityPanel() {
  return (
    <>
      <VercelSidebarBack title="Observability" />
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SubNavItem icon={LayoutGrid} label="Overview" active />
            <SubNavItem icon={Search} label="Query" />
            <SubNavItem icon={FileStack} label="Notebooks" />
            <SubNavItem icon={Bell} label="Alerts" beta />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Compute
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SubNavItem icon={Zap} label="Functions" />
            <SubNavItem icon={Globe} label="External APIs" />
            <SubNavItem icon={Layers} label="Middleware" />
            <SubNavItem icon={Activity} label="Workflows" beta />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          CDN
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SubNavItem icon={Globe} label="Edge Requests" />
            <SubNavItem icon={Cloud} label="Fast Data Transfer" />
            <SubNavItem icon={ImageIcon} label="Image Optimization" />
            <SubNavItem icon={Rocket} label="ISR" />
            <SubNavItem icon={Network} label="External Rewrites" />
            <SubNavItem icon={LayoutGrid} label="Microfrontends" />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Services
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SubNavItem icon={Sparkles} label="AI" />
            <SubNavItem icon={Box} label="Blob" />
            <SubNavItem icon={Server} label="Queues" beta />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

/** SSR: pass defaultPanel from the server so the first paint matches the URL. */
export default function VercelSidebarDemo() {
  const [searchOpen, setSearchOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return
      if (e.defaultPrevented) return
      if (e.key !== "f" && e.key !== "F") return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      e.preventDefault()
      setSearchOpen(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="flex h-[min(42rem,82vh)] w-64 shrink-0 overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground shadow-sm">
      <SidebarProvider className="h-full min-h-0 w-full">
        <VercelSidebarNavProvider>
          <Sidebar collapsible="none" className="h-full min-h-0 w-full border-0">
            <SidebarHeader className="shrink-0 gap-2 border-b border-sidebar-border p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    type="button"
                    className="h-11 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                      M
                    </div>
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate font-medium">mattiaz&apos;s proje…</span>
                        <span className="shrink-0 rounded-md bg-sidebar-accent px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
                          Hobby
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <VercelSidebarSearchPopover
                items={demoSidebarSearchItems}
                open={searchOpen}
                onOpenChange={setSearchOpen}
              >
                <button
                  type="button"
                  className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 text-left shadow-none transition-[color,box-shadow] outline-none hover:bg-sidebar-accent/55 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  aria-label="Search navigation"
                >
                  <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">Find…</span>
                  <kbd className="pointer-events-none hidden h-5 max-h-5 shrink-0 items-center justify-center self-center rounded border border-sidebar-border/80 bg-sidebar/80 px-1.5 font-mono text-[10px] leading-none text-muted-foreground sm:inline-flex">
                    F
                  </kbd>
                </button>
              </VercelSidebarSearchPopover>
            </SidebarHeader>

            <VercelSidebarNav className="gap-0 px-0">
              <VercelSidebarPanel panelId="root" className="gap-0 py-2">
                <RootNav />
              </VercelSidebarPanel>
              <VercelSidebarPanel panelId="observability" className="gap-0 py-2">
                <ObservabilityPanel />
              </VercelSidebarPanel>
            </VercelSidebarNav>

            <SidebarFooter className="shrink-0 border-t border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex w-full items-center gap-2 rounded-md pl-2">
                  <div
                    className="size-6 shrink-0 rounded-full bg-muted bg-cover bg-center ring-1 ring-border"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop)",
                    }}
                    role="img"
                    aria-label="User avatar"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">mattiaz</span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      aria-label="More"
                    >
                      <MoreHorizontal />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="relative text-muted-foreground"
                      aria-label="Notifications"
                    >
                      <Bell />
                      <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-blue-500 ring-2 ring-sidebar" />
                    </Button>
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        </VercelSidebarNavProvider>
      </SidebarProvider>
    </div>
  )
}
