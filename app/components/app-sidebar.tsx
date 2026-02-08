import * as React from "react";
import {
  BadgeCheckIcon,
  BadgePercent,
  ChevronRightIcon,
  Database,
  Gauge,
  Minus,
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
import { Link, useParams } from "react-router";
import { hasPermission, requirePermission } from "utils/permissions";
import { useOrganisation } from "@/hooks/use-organisation";
import { Spinner } from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemActions,
} from "@/components/ui/item";

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
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]  z-10 bg-background"
      // onMouseEnter={toggleSidebar}
      // onMouseLeave={toggleSidebar}
      {...props}
    >
      <SidebarContent className="p-3 tablet:p-0">
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

const DRAWER_SIDES = ["top", "right", "bottom", "left"] as const;

export function MobileDrawerMenu() {
  const { id } = useParams();
  const { businessMember } = useOrganisation();

  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      <Drawer direction={"bottom"} open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="flex items-center justify-center border-r flex-0 md:hidden h-full aspect-square">
            <button
              title="Menu dropdown button"
              // onClick={toggleSidebar}
              className="group/view-toggle ml-4 flex justify-center flex-col border-none space-x-0 items-start gap-1 !bg-transparent rounded-md min-w-[30px] w-[30px] h-[30px]"
            >
              <div className="h-px inline-block left-0 w-4 transition-all ease-out bg-muted-foreground group-hover/view-toggle:bg-foreground p-0 m-0"></div>
              <div className="h-px inline-block left-0 w-3 transition-all ease-out bg-muted-foreground group-hover/view-toggle:bg-foreground p-0 m-0"></div>
            </button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:h-[75vh]">
          <div className="no-scrollbar overflow-y-auto flex flex-col gap-12 overflow-auto px-6 py-8">
            {Object.entries(schema)
              .filter(([, items]) => items.length > 0)
              .map(([group, items], idx) => (
                <div className="flex flex-col gap-4" key={idx}>
                  {/* <div className="text-muted-foreground text-sm font-medium">
                    Menu
                  </div> */}
                  <div className="flex flex-col gap-4">
                    {items.map((item) =>
                      item.items ? (
                        <>
                          <Link
                            to={"org/" + id + "/" + item.url}
                            className="flex items-center gap-4 text-base font-medium"
                            onClick={() => setOpen(false)}
                          >
                            {item.icon && <item.icon className="size-4" />}
                            <span>{item.title}</span>
                          </Link>
                          {item.items.map((sub) => (
                            <Link
                              to={"org/" + id + "/" + sub.url}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-4 text-base font-medium"
                            >
                              <Minus className="text-muted-foreground" />{" "}
                              <span>{sub.title}</span>
                            </Link>
                          ))}
                        </>
                      ) : (
                        <Link
                          to={"org/" + id + "/" + item.url}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-4 text-base font-medium"
                        >
                          {item.icon && <item.icon className="size-4" />}
                          <span>{item.title}</span>
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              ))}

            {!businessMember ? (
              <div>
                <Spinner />
              </div>
            ) : (
              hasPermission(businessMember.role, "business:manage") && (
                <Link
                  to={"org/" + id + "/settings"}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 text-base font-medium"
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
              )
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
