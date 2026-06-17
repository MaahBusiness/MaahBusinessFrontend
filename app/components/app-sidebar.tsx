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
import { useParams } from "react-router";
import { useOrganisation } from "@/hooks/use-organisation";
import {
  filterSidebarByRole,
  SIDEBAR_NAV_SCHEMA,
} from "@/lib/org-navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const { id: routeOrgId } = useParams<{ id: string }>();
  const { businessMember, organisation } = useOrganisation();
  const orgId = routeOrgId ?? organisation?.data?.id;

  const nav = React.useMemo(
    () => filterSidebarByRole(SIDEBAR_NAV_SCHEMA, businessMember?.role),
    [businessMember?.role],
  );

  return (
    <Sidebar
      collapsible="icon"
      className="sticky top-[--header-height] h-[calc(100svh-var(--header-height))] shrink-0 border-border bg-background"
      {...props}
    >
      <SidebarContent>
        <NavMain data={nav} orgId={orgId} />
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
