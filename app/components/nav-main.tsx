import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useParams } from "react-router";
import type { SideItem } from "types";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

export function NavMain({ data }: { data: { [key: string]: SideItem[] } }) {
  const { id: orgId } = useParams<{ id: string }>();

  return Object.entries(data)
    .filter(([, items]) => items.length > 0)
    .map(([group, items]) => (
      <SidebarGroup key={group}>
        {/* <SidebarGroupLabel>{group}</SidebarGroupLabel> */}
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
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>

                  {/* <DropdownMenuContent>
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link to={subItem.url}>
                          <span>{subItem.title}</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent> */}
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroup>
    ));
}
