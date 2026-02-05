import * as React from "react";
import {
  BadgePercent,
  Database,
  Gauge,
  Settings,
  SidebarIcon,
  Users,
  UserStar,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { SideItem } from "types";
import { Link } from "react-router";
import { hasPermission, requirePermission } from "utils/permissions";
import { useOrganisation } from "@/hooks/use-organisation";
import { Spinner } from "@/components/ui/spinner";

// This is the sidebar navigation schema
const schema: { [key: string]: SideItem[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "",
      icon: Gauge,
    },
    {
      title: "Products",
      url: "products",
      icon: Database,
      isActive: true,
      items: [
        {
          title: "All Products",
          url: "products",
        },
        {
          title: "Categories",
          url: "products/categories",
        },
      ],
    },
    {
      title: "Sales",
      url: "invoices",
      icon: BadgePercent,
    },
    {
      title: "Clients",
      url: "clients",
      icon: UserStar,
    },
  ],
  secondary: [
    {
      title: "Team",
      url: "team",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const { businessMember } = useOrganisation();

  return (
    <Sidebar
      collapsible="icon"
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))] border-border z-10 bg-background"
      // onMouseEnter={toggleSidebar}
      // onMouseLeave={toggleSidebar}
      {...props}
    >
      <SidebarContent>
        <NavMain data={schema} />
      </SidebarContent>
      <SidebarFooter>
        {!businessMember ? (
          <SidebarMenuButton asChild>
            <Spinner />
          </SidebarMenuButton>
        ) : (
          hasPermission(businessMember.role, "business:manage") && (
            <SidebarMenuButton tooltip={"Settings"} asChild>
              <Link to={"settings"}>
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          )
        )}

        <SidebarMenuButton
          tooltip={"Toggle sidebar"}
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
          <span>Toggle sidebar</span>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
