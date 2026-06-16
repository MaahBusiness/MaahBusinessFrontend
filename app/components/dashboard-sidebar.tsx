import {
  Building2,
  Package,
  PanelLeft,
  Plus,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { SITE_NAME } from "types/consts";
import { cn } from "@/lib/utils";

const accountNav = [
  {
    title: "All organisations",
    url: "/dashboard/organisations",
    icon: Building2,
    exact: true,
  },
  {
    title: "New organisation",
    url: "/dashboard/organisations/new",
    icon: Plus,
    exact: false,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
    exact: false,
  },
] as const;

export function DashboardSidebar() {
  const { pathname } = useLocation();
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="dashboard-sidebar top-[--header-height] z-20 !h-[calc(100svh-var(--header-height))] border-r border-violet-500/10"
    >
      <SidebarHeader className="border-b border-violet-500/10 p-3">
        <Link
          to="/dashboard/organisations"
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-violet-500/10"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30">
            <Package className="size-4" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold tracking-tight">
              {SITE_NAME}
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              Workspace
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarMenu>
            {accountNav.map((item) => {
              const isActive = item.exact
                ? pathname === item.url
                : pathname.startsWith(item.url);

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200",
                      isActive &&
                        "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-700 dark:text-violet-300 font-medium shadow-sm shadow-violet-500/10",
                    )}
                  >
                    <Link to={item.url}>
                      <item.icon
                        className={cn(
                          isActive && "text-violet-600 dark:text-violet-400",
                        )}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-violet-500/10 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Collapse sidebar"
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground"
            >
              <PanelLeft />
              <span>Collapse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
