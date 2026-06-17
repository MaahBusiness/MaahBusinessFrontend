import {
  BadgePercent,
  Database,
  Gauge,
  PackageSearch,
  Users,
} from "lucide-react";
import type { Role, SideItem } from "types";
import { matchesAnyPermission } from "utils/permissions";

export const SIDEBAR_NAV_SCHEMA: { [key: string]: SideItem[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "",
      icon: Gauge,
      permission: ["dashboard:full", "dashboard:limited"],
    },
    {
      title: "Products",
      url: "products",
      icon: Database,
      isActive: true,
      permission: "products:crud",
      items: [
        {
          title: "All Products",
          url: "products",
          permission: "products:crud",
        },
        {
          title: "Categories",
          url: "products/categories",
          permission: "products:crud",
        },
      ],
    },
    {
      title: "Sales",
      url: "invoices",
      icon: BadgePercent,
      permission: "invoice:create",
    },
    {
      title: "Inventory",
      url: "inventory",
      icon: PackageSearch,
      permission: "stock:movements",
    },
  ],
  secondary: [
    {
      title: "Team",
      url: "team",
      icon: Users,
      permission: "manage:members",
    },
  ],
};

function filterSideItem(role: Role | undefined, item: SideItem): SideItem | null {
  if (item.items?.length) {
    if (item.permission && !matchesAnyPermission(role, item.permission)) {
      return null;
    }

    const items = item.items.filter((sub) =>
      matchesAnyPermission(role, sub.permission ?? item.permission),
    );

    if (items.length === 0) return null;
    return { ...item, items };
  }

  return matchesAnyPermission(role, item.permission) ? item : null;
}

export function filterSidebarByRole(
  schema: { [key: string]: SideItem[] },
  role: Role | undefined,
): { [key: string]: SideItem[] } {
  if (!role) {
    return Object.fromEntries(
      Object.keys(schema).map((group) => [group, [] as SideItem[]]),
    );
  }

  return Object.fromEntries(
    Object.entries(schema).map(([group, items]) => [
      group,
      items
        .map((item) => filterSideItem(role, item))
        .filter((item): item is SideItem => item !== null),
    ]),
  );
}

/** Permission required for an org-scored route (e.g. /dashboard/org/:id/products). */
export function getOrgRoutePermission(
  pathname: string,
): import("utils/permissions").Feature | import("utils/permissions").Feature[] | null {
  const match = pathname.match(/^\/dashboard\/org\/[^/]+(?:\/(.*))?$/);
  if (!match) return null;

  const rest = (match[1] ?? "").replace(/\?.*$/, "");

  if (!rest) return ["dashboard:full", "dashboard:limited"];
  if (rest.startsWith("team")) return "manage:members";
  if (rest.startsWith("products")) return "products:crud";
  if (rest.startsWith("invoices")) return "invoice:create";
  if (rest.startsWith("inventory")) return "stock:movements";

  return null;
}
