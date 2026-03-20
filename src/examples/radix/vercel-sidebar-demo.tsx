"use client"

import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  VercelSidebarBack,
  VercelSidebarNav,
  VercelSidebarPanel,
  useVercelSidebarNav,
} from "./ui/vercel-sidebar"

function RootNav() {
  const { setActivePanel } = useVercelSidebarNav()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton type="button" onClick={() => setActivePanel("observability")}>
          Observability
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton type="button">Projects</SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/** SSR: pass defaultPanel from the server (e.g. route segment) so the first paint matches the URL. */
export default function VercelSidebarDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Root rail swaps to a sub-panel with back + title. Header/footer stay fixed.
      </p>
      <div className="flex h-[22rem] overflow-hidden rounded-lg border border-border">
        <SidebarProvider>
          <Sidebar collapsible="none" className="border-0">
            <SidebarHeader className="shrink-0 border-b border-sidebar-border p-2 text-xs text-muted-foreground">
              Header
            </SidebarHeader>
            <VercelSidebarNav>
              <VercelSidebarPanel panelId="root">
                <RootNav />
              </VercelSidebarPanel>
              <VercelSidebarPanel panelId="observability" className="px-0">
                <VercelSidebarBack title="Observability" />
                <SidebarGroup>
                  <SidebarGroupLabel>Compute</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton type="button">Functions</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </VercelSidebarPanel>
            </VercelSidebarNav>
            <SidebarFooter className="shrink-0 border-t border-sidebar-border p-2 text-xs text-muted-foreground">
              Footer
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </div>
    </div>
  )
}
