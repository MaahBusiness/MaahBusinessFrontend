import { useMemo, useState, useEffect } from "react";
import { addDays, format, parseISO } from "date-fns";
import {
  Activity,
  CreditCard,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CalendarDateRangePicker,
  dateRangeToFilters,
} from "@/components/date-range-picker";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  ProfitAnalyticsChart,
  RevenueTrendChart,
  SalesMixChart,
  SalesVolumeChart,
  TopCategoriesChart,
  TopProductsChart,
} from "@/components/dashboard/dashboard-charts";
import { InventoryAlerts } from "@/components/dashboard/inventory-alerts";
import { DashboardRecentSales } from "@/components/dashboard/recent-sales-list";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
import { DashboardOverviewStrip } from "@/components/dashboard/overview-strip";
import { DashboardEmptyHint } from "@/components/dashboard/empty-hint";
import { DashboardReportsPanel } from "@/components/dashboard/reports-panel";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { dashboardApi, dashboardKeys, invalidateOrgDashboardViews } from "@/lib/api/dashboard";
import type { DashboardInsights, DashboardSummary } from "@/lib/dashboard-types";
import { RequestFailed } from "@/routes/404";
import { formatDisplayAmount } from "utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationsApi } from "@/lib/api/notifications";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  );
}

function ProductMarginsTable({
  margins,
}: {
  margins: DashboardInsights["product_margins"];
}) {
  if (!margins.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No margin data for this period.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 font-medium">Product</th>
            <th className="pb-2 font-medium">Qty sold</th>
            <th className="pb-2 font-medium">Revenue</th>
            <th className="pb-2 font-medium">Profit</th>
            <th className="pb-2 font-medium">Margin</th>
          </tr>
        </thead>
        <tbody>
          {margins.slice(0, 10).map((row) => (
            <tr key={row.product_id} className="border-b border-border/50">
              <td className="py-2.5 font-medium">{row.product_name}</td>
              <td className="py-2.5">{row.total_quantity_sold}</td>
              <td className="py-2.5">{formatDisplayAmount(row.total_revenue)}</td>
              <td className="py-2.5 text-emerald-700 dark:text-emerald-400">
                {formatDisplayAmount(row.total_profit)}
              </td>
              <td className="py-2.5">
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                  {Number(row.margin_percentage).toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OrganisationDashboard() {
  const { organisation: res, isLoading, error, businessMember } =
    useOrganisation();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const orgId = res?.data?.id;
  const orgName = res?.data?.name;

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filters = useMemo(() => dateRangeToFilters(dateRange), [dateRange]);

  useEffect(() => {
    if (orgId) void invalidateOrgDashboardViews(queryClient, orgId);
  }, [orgId, queryClient]);

  const isOwner = businessMember?.role === "owner";

  const dashboardQueryOpts = {
    staleTime: 60 * 1000,
    refetchOnMount: "always" as const,
  };

  const summaryQuery = useQuery({
    queryKey: dashboardKeys.summary(orgId!, filters),
    queryFn: async () => dashboardApi.getSummary(accessToken!, orgId!, filters),
    enabled: !!orgId && !!accessToken && isOwner,
    ...dashboardQueryOpts,
  });

  const insightsQuery = useQuery({
    queryKey: dashboardKeys.insights(orgId!, filters),
    queryFn: async () => dashboardApi.getInsights(accessToken!, orgId!, filters),
    enabled: !!orgId && !!accessToken && isOwner,
    ...dashboardQueryOpts,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => notificationsApi.list(accessToken!),
    enabled: !!accessToken && isOwner,
  });

  if (isLoading || error || !res?.success) return <DashboardSkeleton />;
  if (!orgId) return <RequestFailed />;

  if (!isOwner) {
    return (
      <StaffDashboard
        orgId={orgId}
        orgName={orgName ?? "Organisation"}
        role={businessMember?.role ?? "cashier"}
      />
    );
  }

  if (summaryQuery.isLoading || insightsQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (!summaryQuery.data?.success || !insightsQuery.data?.success) {
    return (
      <RequestFailed
        refetch={async () => {
          await Promise.all([summaryQuery.refetch(), insightsQuery.refetch()]);
        }}
      />
    );
  }

  const summary = summaryQuery.data.data as DashboardSummary;
  const insights = insightsQuery.data.data as DashboardInsights;
  const notifications = (notificationsQuery.data?.data as Array<{
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>) ?? [];

  const marginPct = Number(summary.profit.profit_margin_percentage);
  const isPeriodEmpty =
    summary.revenue.total_orders === 0 &&
    insights.daily_data.every((d) => d.total_sales === 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        summaryQuery.refetch(),
        insightsQuery.refetch(),
        notificationsQuery.refetch(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="dashboard-page relative min-h-full w-full">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />
      <div aria-hidden className="dashboard-orb dashboard-orb-emerald" />

      <div className="relative z-10 w-full space-y-6 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
              <Sparkles className="size-3.5" />
              Live analytics
            </div>
            <h1 className="dashboard-hero-title text-3xl font-bold tracking-tight sm:text-4xl">
              {orgName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Financial overview · {summary.period.start_date.slice(0, 10)} to{" "}
              {summary.period.end_date.slice(0, 10)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDateRangePicker value={dateRange} onRangeChange={setDateRange} />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              disabled={isRefreshing}
              onClick={handleRefresh}
              aria-label="Refresh dashboard"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <DashboardQuickActions orgId={orgId} role={businessMember?.role} />

        <DashboardOverviewStrip summary={summary} />

        {summary.generated_at && (
          <p className="text-xs text-muted-foreground">
            Last updated {format(parseISO(summary.generated_at), "MMM d, yyyy · HH:mm")}
          </p>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(tab) => setSearchParams(tab === "overview" ? {} : { tab })}
          className="space-y-6"
        >
          <TabsList className="bg-card/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <span className="ml-1.5 rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] text-white">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isPeriodEmpty && (
              <DashboardEmptyHint orgId={orgId} role={businessMember?.role} />
            )}

            {/* KPI row 1 */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Total revenue"
                value={formatDisplayAmount(summary.revenue.total_revenue)}
                subtitle={`${summary.revenue.total_orders} orders`}
                icon={DollarSign}
                accent="violet"
                trend={{
                  value: `${formatDisplayAmount(summary.revenue.revenue_this_month)} this month`,
                  positive: true,
                }}
              />
              <KpiCard
                title="Net profit"
                value={formatDisplayAmount(summary.profit.total_profit)}
                subtitle={`${marginPct.toFixed(1)}% margin`}
                icon={TrendingUp}
                accent="emerald"
              />
              <KpiCard
                title="Expenses"
                value={formatDisplayAmount(summary.expenses.total_expenses)}
                subtitle={`Salaries ${formatDisplayAmount(summary.expenses.salary_expenses)}`}
                icon={Wallet}
                accent="orange"
              />
              <KpiCard
                title="Avg. order value"
                value={formatDisplayAmount(summary.revenue.average_order_value)}
                subtitle={`${summary.revenue.orders_this_week} orders this week`}
                icon={ShoppingCart}
                accent="blue"
              />
            </div>

            {/* KPI row 2 */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Customers"
                value={String(summary.customers.total_customers)}
                subtitle={`${summary.customers.new_customers_this_month} new this month`}
                icon={Users}
                accent="cyan"
              />
              <KpiCard
                title="Credit outstanding"
                value={formatDisplayAmount(summary.customers.total_credit_amount)}
                subtitle={`${formatDisplayAmount(summary.customers.overdue_credit_amount)} overdue`}
                icon={CreditCard}
                accent="rose"
              />
              <KpiCard
                title="Products"
                value={String(summary.inventory.total_products)}
                subtitle={`${summary.inventory.low_stock_products} low stock`}
                icon={Package}
                accent="blue"
              />
              <KpiCard
                title="Today's activity"
                value={formatDisplayAmount(summary.revenue.revenue_today)}
                subtitle={`${summary.revenue.orders_today} orders today`}
                icon={Activity}
                accent="violet"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-7">
              <div className="lg:col-span-4">
                <RevenueTrendChart dailyData={insights.daily_data} />
              </div>
              <div className="flex flex-col gap-4 lg:col-span-3">
                <SalesMixChart performance={insights.sales_performance} />
                <SalesVolumeChart dailyData={insights.daily_data} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <TopProductsChart products={insights.top_products} />
              <TopCategoriesChart categories={insights.top_categories} />
              <InventoryAlerts inventory={summary.inventory} orgId={orgId} />
            </div>

            <DashboardRecentSales sales={insights.recent_sales} orgId={orgId} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <ProfitAnalyticsChart dailyData={insights.daily_data} />
              <Card className="border-violet-500/15 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Period totals</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Gross profit", value: insights.totals.gross_profit, color: "text-emerald-600" },
                    { label: "Net profit", value: insights.totals.net_profit, color: "text-cyan-600" },
                    { label: "Total expenses", value: insights.totals.total_expenses, color: "text-orange-600" },
                    { label: "Credit outstanding", value: insights.totals.credit_outstanding, color: "text-violet-600" },
                    { label: "Total sales", value: String(insights.totals.total_sales), color: "text-blue-600" },
                    { label: "Lifetime revenue", value: summary.overview.lifetime_revenue, color: "text-violet-600" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-border/50 bg-muted/30 p-3"
                    >
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={`mt-1 text-lg font-bold ${item.color}`}>
                        {item.label === "Total sales"
                          ? item.value
                          : formatDisplayAmount(item.value)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-emerald-500/15 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Product margins</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductMarginsTable margins={insights.product_margins} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export reports for{" "}
              {summary.period.start_date.slice(0, 10)} —{" "}
              {summary.period.end_date.slice(0, 10)}
            </p>
            <DashboardReportsPanel
              orgId={orgId}
              accessToken={accessToken!}
              filters={filters}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-violet-500/15 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.slice(0, 15).map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl border p-4 ${
                        n.is_read
                          ? "border-border/50 bg-muted/20"
                          : "border-violet-500/25 bg-violet-500/5"
                      }`}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
