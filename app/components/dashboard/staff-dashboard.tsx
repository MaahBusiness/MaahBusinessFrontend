import { useMemo } from "react";
import {
  Activity,
  Package,
  Receipt,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
import { DashboardRecentSales } from "@/components/dashboard/recent-sales-list";
import { DashboardEmptyHint } from "@/components/dashboard/empty-hint";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { inventoryApi } from "@/lib/api/inventory";
import { formatDisplayAmount } from "utils";
import type { DashboardInsights } from "@/lib/dashboard-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StaffDashboard({
  orgId,
  orgName,
  role,
}: {
  orgId: string;
  orgName: string;
  role: string;
}) {
  const { accessToken, user } = useAuth();
  const { fetchInvoices, fetchProducts, fetchMembers } = useOrganisation();

  const invoices = fetchInvoices();
  const products = fetchProducts();
  const members = fetchMembers();

  const lowStockQuery = useQuery({
    queryKey: ["inventory", orgId, "low-stock"],
    queryFn: () => inventoryApi.getLowStockProducts(accessToken!, orgId),
    enabled: !!accessToken && !!orgId,
  });

  const invoiceList = invoices.data?.data ?? [];
  const todayTotal = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return invoiceList
      .filter((inv) => inv.created_at?.startsWith(today))
      .reduce((sum, inv) => sum + Number(inv.total), 0);
  }, [invoiceList]);

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

  const hasActivity = invoiceList.length > 0;

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

        <DashboardQuickActions orgId={orgId} />

        {!hasActivity && <DashboardEmptyHint orgId={orgId} />}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Today's sales"
            value={formatDisplayAmount(todayTotal)}
            subtitle={`${invoiceList.filter((i) => i.created_at?.startsWith(new Date().toISOString().slice(0, 10))).length} invoices`}
            icon={Receipt}
            accent="violet"
          />
          <KpiCard
            title="Products"
            value={String(products.data?.data?.length ?? "—")}
            subtitle="In catalog"
            icon={Package}
            accent="blue"
          />
          <KpiCard
            title="Low stock"
            value={String(lowStockQuery.data?.data?.length ?? 0)}
            subtitle="Needs attention"
            icon={ShoppingCart}
            accent="orange"
          />
          <KpiCard
            title="Team online"
            value={String(
              members.data?.data?.filter((m) => m.is_active).length ?? "—",
            )}
            subtitle="Active members"
            icon={Users}
            accent="emerald"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardRecentSales sales={recentSales} orgId={orgId} />
          <Card className="border-violet-500/15 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                { label: "Open POS / Invoices", to: "invoices", icon: Receipt },
                { label: "Check inventory", to: "inventory", icon: Activity },
                { label: "Browse products", to: "products", icon: Package },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={`/dashboard/org/${orgId}/${item.to}`}
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:border-violet-500/30 hover:bg-violet-500/5"
                >
                  <item.icon className="size-4 text-violet-600" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
