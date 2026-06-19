import * as React from "react";
import { SidebarIcon } from "lucide-react";
import { useParams } from "react-router";

import { OrgSidebarNav } from "@/components/layout/org-sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganisation } from "@/hooks/use-organisation";
import { normalizeRole } from "utils/permissions";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const { id: orgId } = useParams<{ id: string }>();
  const { businessMember, isLoading, isMembersLoading } = useOrganisation();

  const role = normalizeRole(businessMember?.role);
  const membershipPending = isLoading || isMembersLoading;

  return (
    <Sidebar
      collapsible="icon"
      className="sticky top-[--header-height] h-[calc(100svh-var(--header-height))] shrink-0 border-border bg-background"
      {...props}
    >
      <SidebarContent>
        {!orgId ? null : membershipPending && !role ? (
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <OrgSidebarNav role={role} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          tooltip="Toggle sidebar"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
