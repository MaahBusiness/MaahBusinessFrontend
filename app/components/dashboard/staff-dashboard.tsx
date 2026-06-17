import { useMemo } from "react";
import {
  Activity,
  Package,
  Receipt,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
import { DashboardRecentSales } from "@/components/dashboard/recent-sales-list";
import { DashboardEmptyHint } from "@/components/dashboard/empty-hint";
import { CashierHomeDashboard } from "@/components/dashboard/cashier-home-dashboard";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { inventoryApi } from "@/lib/api/inventory";
import { filterByRole } from "@/lib/dashboard-widgets";
import { formatDisplayAmount } from "utils";
import type { DashboardInsights } from "@/lib/dashboard-types";
import type { Feature } from "utils/permissions";
import { hasPermission } from "utils/permissions";
import type { Role } from "types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { orgPath, orgSalesPath } from "@/lib/org-navigation";

const shortcuts = [
  {
    id: "invoices",
    label: "Open POS / Invoices",
    href: (orgId: string) => orgSalesPath(orgId),
    icon: Receipt,
    permission: "invoice:create" as Feature,
  },
  {
    id: "inventory",
    label: "Check inventory",
    href: (orgId: string) => orgPath(orgId, "inventory"),
    icon: Activity,
    permission: "stock:movements" as Feature,
  },
  {
    id: "products",
    label: "Browse products",
    href: (orgId: string) => orgPath(orgId, "products"),
    icon: Package,
    permission: "products:crud" as Feature,
  },
] as const;

type StaffKpi = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accent: "violet" | "blue" | "orange" | "emerald";
  permission: Feature | Feature[];
};

export function StaffDashboard({
  orgId,
  orgName,
  role,
}: {
  orgId: string;
  orgName: string;
  role: Role;
}) {
  const { accessToken, user } = useAuth();
  const { fetchInvoices, fetchProducts, fetchMembers } = useOrganisation();

  const canViewSales = hasPermission(role, "invoice:create");
  const canViewProducts = hasPermission(role, "products:crud");
  const canViewTeam = hasPermission(role, "manage:members");
  const canViewInventory = hasPermission(role, "stock:movements");

  const invoices = fetchInvoices(undefined, { enabled: canViewSales });
  const products = fetchProducts(undefined, { enabled: canViewProducts });
  const members = fetchMembers({ enabled: canViewTeam });

  const lowStockQuery = useQuery({
    queryKey: ["inventory", orgId, "low-stock"],
    queryFn: () => inventoryApi.getLowStockProducts(accessToken!, orgId),
    enabled: !!accessToken && !!orgId && canViewInventory,
  });

  const invoiceList = canViewSales ? (invoices.data?.data ?? []) : [];
  const today = new Date().toISOString().slice(0, 10);

  const todayTotal = useMemo(() => {
    return invoiceList
      .filter((inv) => inv.created_at?.startsWith(today))
      .reduce((sum, inv) => sum + Number(inv.total), 0);
  }, [invoiceList, today]);

  const recentSales: DashboardInsights["recent_sales"] = invoiceList
    .slice(0, 8)
    .map((inv) => ({
      invoice_id: inv.id,
      invoice_number: inv.number,
      customer_name: inv.customer_name ?? null,
      total: String(inv.total),
      status: inv.status,
      created_at: inv.created_at,
    }));

  const kpiCards = useMemo<StaffKpi[]>(() => {
    const cards: StaffKpi[] = [];

    if (canViewSales) {
      cards.push({
        id: "today-sales",
        title: "Today's sales",
        value: formatDisplayAmount(todayTotal),
        subtitle: `${invoiceList.filter((i) => i.created_at?.startsWith(today)).length} invoices`,
        icon: Receipt,
        accent: "violet",
        permission: "invoice:create",
      });
    }

    if (canViewProducts) {
      cards.push({
        id: "products",
        title: "Products",
        value: String(products.data?.data?.length ?? "—"),
        subtitle: "In catalog",
        icon: Package,
        accent: "blue",
        permission: "products:crud",
      });
    }

    if (canViewInventory) {
      cards.push({
        id: "low-stock",
        title: "Low stock",
        value: String(lowStockQuery.data?.data?.length ?? 0),
        subtitle: "Needs attention",
        icon: ShoppingCart,
        accent: "orange",
        permission: "stock:movements",
      });
    }

    if (canViewTeam) {
      cards.push({
        id: "team",
        title: "Team online",
        value: String(
          members.data?.data?.filter((m) => m.is_active).length ?? "—",
        ),
        subtitle: "Active members",
        icon: Users,
        accent: "emerald",
        permission: "manage:members",
      });
    }

    return cards;
  }, [
    canViewInventory,
    canViewProducts,
    canViewSales,
    canViewTeam,
    invoiceList,
    lowStockQuery.data?.data?.length,
    members.data?.data,
    products.data?.data?.length,
    today,
    todayTotal,
  ]);

  const visibleShortcuts = filterByRole(role, shortcuts);
  const hasActivity = canViewSales && invoiceList.length > 0;
  const showRecentSales = canViewSales && role !== "cashier";
  const showShortcuts = visibleShortcuts.length > 0 && role !== "cashier";

  if (role === "cashier") {
    return (
      <CashierHomeDashboard orgId={orgId} orgName={orgName} role={role} />
    );
  }

  return (
    <div className="dashboard-page relative min-h-full">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />

      <div className="relative z-10 space-y-6 p-6 lg:p-8">
        <div className="space-y-2">
          <Badge variant="secondary" className="capitalize">
            {role.replace("_", " ")} workspace
          </Badge>
          <h1 className="dashboard-hero-title text-3xl font-bold tracking-tight">
            Hello, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Operational view for <strong>{orgName}</strong> — jump into your
            daily tasks below.
          </p>
        </div>

        <DashboardQuickActions orgId={orgId} role={role} />

        {!hasActivity && (
          <DashboardEmptyHint orgId={orgId} role={role} />
        )}

        {kpiCards.length > 0 && (
          <div
            className={cn(
              "grid gap-4 sm:grid-cols-2",
              kpiCards.length === 1 && "xl:grid-cols-1",
              kpiCards.length === 2 && "xl:grid-cols-2",
              kpiCards.length === 3 && "xl:grid-cols-3",
              kpiCards.length >= 4 && "xl:grid-cols-4",
            )}
          >
            {kpiCards.map((card) => (
              <KpiCard
                key={card.id}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                accent={card.accent}
              />
            ))}
          </div>
        )}

        {(showRecentSales || showShortcuts) && (
          <div
            className={`grid gap-4 ${
              showRecentSales && showShortcuts ? "lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {showRecentSales && (
              <DashboardRecentSales sales={recentSales} orgId={orgId} />
            )}
            {showShortcuts && (
              <Card className="border-violet-500/15 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Shortcuts</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {visibleShortcuts.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href(orgId)}
                      className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:border-violet-500/30 hover:bg-violet-500/5"
                    >
                      <item.icon className="size-4 text-violet-600" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
