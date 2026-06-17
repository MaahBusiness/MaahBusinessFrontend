import { ChevronRight } from "lucide-react";
import { NavLink, useLocation, useParams } from "react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { isOrgSegmentActive, orgPath } from "@/lib/org-navigation";
import type { SideItem } from "types";
import { cn } from "@/lib/utils";

export function NavMain({
  data,
  orgId: orgIdProp,
}: {
  data: { [key: string]: SideItem[] };
  orgId?: string;
}) {
  const { id: routeOrgId } = useParams<{ id: string }>();
  const orgId = orgIdProp ?? routeOrgId;
  const { pathname } = useLocation();
  const { setOpen } = useSidebar();

  if (!orgId) return null;

  return Object.entries(data)
    .filter(([, items]) => items.length > 0)
    .map(([group, items]) => (
      <SidebarGroup key={group}>
        <SidebarMenu>
          {items.map((item) =>
            item.items ? (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => setOpen(true)}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isOrgSegmentActive(
                              pathname,
                              orgId,
                              subItem.url,
                            )}
                          >
                            <NavLink to={orgPath(orgId, subItem.url)}>
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isOrgSegmentActive(pathname, orgId, item.url)}
                >
                  <NavLink
                    to={orgPath(orgId, item.url)}
                    className={({ isActive }) =>
                      cn(isActive && "font-medium")
                    }
                    end={item.url === "home"}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroup>
    ));
}
