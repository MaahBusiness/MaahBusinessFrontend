import * as React from "react";
import {
  BadgePercent,
  Database,
  Gauge,
  SidebarIcon,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { SideItem } from "types";

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
    // {
    //   title: "Sales",
    //   url: "team",
    //   icon: BadgePercent,
    // },
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

  return (
    <Sidebar
      collapsible="icon"
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))] border-border z-10 bg-background"
      {...props}
    >
      <SidebarContent>
        <NavMain data={schema} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
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
