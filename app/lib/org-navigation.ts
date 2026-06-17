import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Database,
  FileBarChart,
  Gauge,
  Package,
  PackagePlus,
  PackageSearch,
  Receipt,
  UserPlus,
  UserRound,
  Users,
  Warehouse,
} from "lucide-react";
import type { Role, SideItem } from "types";
import type { Feature } from "utils/permissions";
import { matchesAnyPermission } from "utils/permissions";

/** Reserved product slug segments that are real org routes, not product IDs. */
export const RESERVED_PRODUCT_SLUGS = new Set(["clients", "archived"]);

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

/** Build an absolute org-scoped path. Never returns a relative segment. */
export function orgPath(orgId: string | undefined, segment?: string): string {
  if (!orgId) return "/dashboard/organisations";

  const base = `/dashboard/org/${orgId}`;
  if (!segment) return `${base}/home`;
  if (segment.includes("?")) return `${base}/${segment}`;
  return `${base}/${segment.replace(/^\//, "")}`;
}

export function orgSalesPath(orgId: string) {
  return orgPath(orgId, "invoices");
}

export function orgNewSalePath(orgId: string) {
  return `${orgSalesPath(orgId)}?new=1`;
}

export function orgClientsPath(orgId: string) {
  return orgPath(orgId, "clients");
}

export function orgProductsPath(orgId: string) {
  return orgPath(orgId, "products");
}

export function orgHomePath(orgId: string) {
  return orgPath(orgId, "home");
}

export function orgInvoicePath(orgId: string, invoiceId: string) {
  return orgPath(orgId, `invoices/${invoiceId}`);
}

export function isOrgSegmentActive(
  pathname: string,
  orgId: string | undefined,
  segment?: string,
) {
  if (!orgId) return false;

  const target = orgPath(orgId, segment);
  if (!segment || segment === "home") {
    return (
      pathname === target ||
      pathname === `/dashboard/org/${orgId}` ||
      pathname === `/dashboard/org/${orgId}/`
    );
  }

  return pathname === target || pathname.startsWith(`${target}/`);
}

export function getDefaultOrgLanding(role: Role | undefined): string {
  if (role === "cashier") return "invoices";
  return "home";
}

export function getPermissionFallbackPath(
  orgId: string | undefined,
  role: Role | undefined,
): string {
  if (!orgId) return "/dashboard/organisations";

  if (matchesAnyPermission(role, "invoice:create")) {
    return orgSalesPath(orgId);
  }
  if (matchesAnyPermission(role, ["dashboard:full", "dashboard:limited"])) {
    return orgHomePath(orgId);
  }
  return "/dashboard/organisations";
}

// ---------------------------------------------------------------------------
// Route permissions (RBAC)
// ---------------------------------------------------------------------------

type RouteRule = {
  test: (rest: string) => boolean;
  permission: Feature | Feature[];
};

const ORG_ROUTE_RULES: RouteRule[] = [
  {
    test: (rest) => !rest || rest === "home",
    permission: ["dashboard:full", "dashboard:limited"],
  },
  { test: (rest) => rest.startsWith("team"), permission: "manage:members" },
  { test: (rest) => rest.startsWith("invoices"), permission: "invoice:create" },
  {
    test: (rest) => rest.startsWith("clients"),
    permission: ["customers:view", "customers:crud"],
  },
  { test: (rest) => rest.startsWith("products"), permission: "products:crud" },
  { test: (rest) => rest.startsWith("inventory"), permission: "stock:movements" },
];

export function getOrgRoutePermission(
  pathname: string,
): Feature | Feature[] | null {
  const match = pathname.match(/^\/dashboard\/org\/[^/]+(?:\/(.*))?$/);
  if (!match) return null;

  const rest = (match[1] ?? "").replace(/\?.*$/, "");
  const rule = ORG_ROUTE_RULES.find((r) => r.test(rest));
  return rule?.permission ?? null;
}

// ---------------------------------------------------------------------------
// Sidebar schema
// ---------------------------------------------------------------------------

export const SIDEBAR_NAV_SCHEMA: { [key: string]: SideItem[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "home",
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
        { title: "All Products", url: "products", permission: "products:crud" },
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
      title: "Customers",
      url: "clients",
      icon: UserRound,
      permission: ["customers:view", "customers:crud"],
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

// ---------------------------------------------------------------------------
// Dashboard quick actions (single source of truth)
// ---------------------------------------------------------------------------

export type OrgQuickAction = {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  href: (orgId: string) => string;
  gradient: string;
  shadow: string;
  permission: Feature | Feature[];
};

export const ORG_QUICK_ACTIONS: readonly OrgQuickAction[] = [
  {
    id: "new-sale",
    label: "New sale",
    desc: "Create invoice",
    icon: Receipt,
    href: orgNewSalePath,
    gradient: "from-violet-600 to-indigo-600",
    shadow: "shadow-violet-500/25",
    permission: "invoice:create",
  },
  {
    id: "add-product",
    label: "Add product",
    desc: "Expand catalog",
    icon: PackagePlus,
    href: orgProductsPath,
    gradient: "from-blue-600 to-cyan-600",
    shadow: "shadow-blue-500/25",
    permission: "products:crud",
  },
  {
    id: "clients",
    label: "Clients",
    desc: "Manage customers",
    icon: UserPlus,
    href: orgClientsPath,
    gradient: "from-emerald-600 to-teal-600",
    shadow: "shadow-emerald-500/25",
    permission: ["customers:view", "customers:crud"],
  },
  {
    id: "inventory",
    label: "Inventory",
    desc: "Stock levels",
    icon: Warehouse,
    href: (id) => orgPath(id, "inventory"),
    gradient: "from-orange-600 to-amber-600",
    shadow: "shadow-orange-500/25",
    permission: "stock:movements",
  },
  {
    id: "team",
    label: "Team",
    desc: "Members & roles",
    icon: Users,
    href: (id) => orgPath(id, "team"),
    gradient: "from-rose-600 to-pink-600",
    shadow: "shadow-rose-500/25",
    permission: "manage:members",
  },
  {
    id: "reports",
    label: "Sales history",
    desc: "Browse invoices",
    icon: FileBarChart,
    href: orgSalesPath,
    gradient: "from-fuchsia-600 to-purple-600",
    shadow: "shadow-fuchsia-500/25",
    permission: ["reports:sales", "invoice:create"],
  },
] as const;

export const ORG_EMPTY_HINTS = [
  {
    id: "sale",
    label: "Create sale",
    icon: Receipt,
    href: orgNewSalePath,
    variant: "primary" as const,
    permission: "invoice:create" as Feature,
  },
  {
    id: "product",
    label: "Add product",
    icon: Package,
    href: orgProductsPath,
    variant: "outline" as const,
    permission: "products:crud" as Feature,
  },
] as const;
