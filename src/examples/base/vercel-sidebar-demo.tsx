"use client"

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

import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  VercelSidebarBack,
  VercelSidebarNav,
  VercelSidebarPanel,
  useVercelSidebarNav,
} from "./ui/vercel-sidebar"

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
  return (
    <div className="flex h-[min(42rem,82vh)] w-full max-w-[17.5rem] overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground shadow-sm">
      <SidebarProvider>
        <Sidebar collapsible="none" className="h-full border-0">
          <SidebarHeader className="shrink-0 gap-2 border-b border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  type="button"
                  className="h-11 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white">
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
            <div className="flex h-9 items-center gap-2 rounded-md bg-sidebar-accent/40 px-2">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <SidebarInput
                className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                placeholder="Find…"
              />
              <kbd className="hidden h-5 shrink-0 items-center justify-center rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-[10px] leading-none text-muted-foreground sm:inline-flex">
                F
              </kbd>
            </div>
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
                <div className="flex w-full items-center gap-2 rounded-md">
                  <div
                    className="size-8 shrink-0 rounded-full bg-muted bg-cover bg-center ring-1 ring-border"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop)",
                    }}
                    role="img"
                    aria-label="User avatar"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">mattiaz</span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <SidebarMenuButton
                      type="button"
                      size="sm"
                      className="size-8 p-0 text-muted-foreground"
                      aria-label="More"
                    >
                      <MoreHorizontal className="size-4" />
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      type="button"
                      size="sm"
                      className="relative size-8 p-0 text-muted-foreground"
                      aria-label="Notifications"
                    >
                      <Bell className="size-4" />
                      <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-blue-500 ring-2 ring-sidebar" />
                    </SidebarMenuButton>
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}
