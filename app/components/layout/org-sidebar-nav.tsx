import { ChevronRight, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation, useParams } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  filterSidebarByRole,
  isOrgSegmentActive,
  orgPath,
  SIDEBAR_NAV_SCHEMA,
} from "@/lib/org-navigation";
import { cn } from "@/lib/utils";
import type { Role } from "types";
import { normalizeRole } from "utils/permissions";

/** Base styles for every sidebar link — plain NavLink, no Slot/Tooltip wrappers. */
const linkBase =
  "flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,padding,color,background-color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:shrink-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 [&>svg]:size-4 [&>svg]:shrink-0";

const linkLabel = "truncate group-data-[collapsible=icon]:hidden";

const linkActive =
  "bg-violet-500/15 font-semibold text-violet-700 shadow-[inset_3px_0_0_0_hsl(262.1_83.3%_57.8%)] dark:bg-violet-500/20 dark:text-violet-200 [&>svg]:text-violet-600 dark:[&>svg]:text-violet-300 group-data-[collapsible=icon]:shadow-none";

const subLinkBase =
  "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2";

const subLinkActive =
  "bg-violet-500/12 font-medium text-violet-700 shadow-[inset_2px_0_0_0_hsl(262.1_83.3%_57.8%)] dark:bg-violet-500/15 dark:text-violet-200";

function OrgSidebarLink({
  orgId,
  segment,
  label,
  icon: Icon,
  end,
}: {
  orgId: string;
  segment: string;
  label: string;
  icon?: LucideIcon;
  end?: boolean;
}) {
  const href = orgPath(orgId, segment);

  return (
    <SidebarMenuItem>
      <NavLink
        to={href}
        end={end}
        title={label}
        className={({ isActive }) =>
          cn(linkBase, isActive && linkActive)
        }
      >
        {Icon && <Icon />}
        <span className={linkLabel}>{label}</span>
      </NavLink>
    </SidebarMenuItem>
  );
}

function OrgSidebarSubLink({
  orgId,
  segment,
  label,
}: {
  orgId: string;
  segment: string;
  label: string;
}) {
  const href = orgPath(orgId, segment);

  return (
    <li>
      <NavLink
        to={href}
        title={label}
        className={({ isActive }) =>
          cn(subLinkBase, isActive && subLinkActive)
        }
      >
        <span className={linkLabel}>{label}</span>
      </NavLink>
    </li>
  );
}

function OrgSidebarGroup({
  orgId,
  label,
  items,
}: {
  orgId: string;
  label?: string;
  items: ReturnType<typeof filterSidebarByRole>["navMain"];
}) {
  const { pathname } = useLocation();
  const [productsOpen, setProductsOpen] = useState(true);

  if (!items.length) return null;

  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {items.map((item) => {
          if (item.items?.length) {
            const parentActive = isOrgSegmentActive(pathname, orgId, item.url);
            const childActive = item.items.some((sub) =>
              isOrgSegmentActive(pathname, orgId, sub.url),
            );
            const open = productsOpen || parentActive || childActive;

            return (
              <SidebarMenuItem key={item.title}>
                <div className="flex w-full min-w-0 items-center group-data-[collapsible=icon]:block">
                  <NavLink
                    to={orgPath(orgId, item.url)}
                    title={item.title}
                    className={({ isActive }) =>
                      cn(
                        linkBase,
                        "min-w-0 flex-1 group-data-[collapsible=icon]:flex-none",
                        isActive && linkActive,
                      )
                    }
                  >
                    {item.icon && <item.icon />}
                    <span className={linkLabel}>{item.title}</span>
                  </NavLink>
                  <button
                    type="button"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground group-data-[collapsible=icon]:hidden"
                    aria-expanded={open}
                    aria-label={`Toggle ${item.title} menu`}
                    onClick={() => setProductsOpen((v) => !v)}
                  >
                    <ChevronRight
                      className={cn(
                        "size-4 transition-transform",
                        open && "rotate-90",
                      )}
                    />
                  </button>
                </div>
                {open && (
                  <ul className="mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden">
                    {item.items.map((sub) => (
                      <OrgSidebarSubLink
                        key={sub.title}
                        orgId={orgId}
                        segment={sub.url}
                        label={sub.title}
                      />
                    ))}
                  </ul>
                )}
              </SidebarMenuItem>
            );
          }

          return (
            <OrgSidebarLink
              key={item.title}
              orgId={orgId}
              segment={item.url}
              label={item.title}
              icon={item.icon}
              end={item.url === "home"}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function OrgSidebarNav({ role }: { role?: Role | string }) {
  const { id: orgId } = useParams<{ id: string }>();
  const normalizedRole = normalizeRole(role);

  if (!orgId) {
    return null;
  }

  const nav = filterSidebarByRole(SIDEBAR_NAV_SCHEMA, normalizedRole);

  return (
    <>
      <OrgSidebarGroup orgId={orgId} items={nav.navMain} />
      {nav.secondary?.length ? (
        <OrgSidebarGroup
          orgId={orgId}
          label="Administration"
          items={nav.secondary}
        />
      ) : null}
    </>
  );
}
