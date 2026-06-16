// Page for a single organisation/business
import { CardsStats } from "@/components/dashboard/cards/revenue";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { OverviewChart } from "@/components/overview";
import { RecentSales } from "@/components/recent-sales";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { dashboardApi } from "@/lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";

export default function OrganisationDashboard() {
  const { organisation: res, isLoading, error, fetchInvoices } = useOrganisation();
  const { accessToken } = useAuth();
  const orgId = res?.data?.id;

  const summaryQuery = useQuery({
    queryKey: ["dashboard", orgId, "summary"],
    queryFn: async () => dashboardApi.getSummary(accessToken!, orgId!),
    enabled: !!orgId && !!accessToken,
  });
  const insightsQuery = useQuery({
    queryKey: ["dashboard", orgId, "insights"],
    queryFn: async () => dashboardApi.getInsights(accessToken!, orgId!),
    enabled: !!orgId && !!accessToken,
  });
  const invoicesQuery = fetchInvoices();
  const summaryData = (summaryQuery.data?.data ?? {}) as any;
  const insightsData = (insightsQuery.data?.data ?? {}) as any;

  if (isLoading || error || !res?.success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="aspect-video w-full" />
        </div>
        <Skeleton className=" min-h-[100vh] flex-1 md:min-h-min" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">At a glance</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Button>Download</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CardsStats
              totalRevenue={Number(summaryData.revenue?.total_revenue || 0)}
              totalOrders={Number(summaryData.revenue?.total_orders || 0)}
              chartData={
                (insightsData.daily_data || []).map((item: any) => ({
                  revenue: Number(item.total_revenue || 0),
                  subscription: Number(item.total_sales || 0),
                })) || []
              }
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Number(
                    summaryData.inventory?.low_stock_products || 0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Low stock products
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <OverviewChart chartData={insightsData.daily_data || []} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Latest invoices in your business.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales sales={invoicesQuery.data?.data || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}
