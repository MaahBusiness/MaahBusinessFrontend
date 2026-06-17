import * as React from "react";
import { SidebarIcon } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganisation } from "@/hooks/use-organisation";
import {
  filterSidebarByRole,
  SIDEBAR_NAV_SCHEMA,
} from "@/lib/sidebar-nav";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const { businessMember } = useOrganisation();

  const nav = React.useMemo(
    () => filterSidebarByRole(SIDEBAR_NAV_SCHEMA, businessMember?.role),
    [businessMember?.role],
  );

  return (
    <Sidebar
      collapsible="icon"
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))] border-border z-10 bg-background"
      {...props}
    >
      <SidebarContent>
        <NavMain data={nav} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          tooltip={"Toggle sidebar"}
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
