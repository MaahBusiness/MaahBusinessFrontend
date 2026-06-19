import { Link } from "react-router";
import {
  ArrowRight,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCashierStats } from "@/hooks/use-cashier-stats";
import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
import { DashboardEmptyHint } from "@/components/dashboard/empty-hint";
import { ProductStatsGrid } from "@/components/products/product-stats-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgPageShell } from "@/components/layout/org-page-shell";
import { formatDisplayAmount } from "utils";
import {
  orgClientsPath,
  orgInvoicePath,
  orgNewSalePath,
  orgSalesPath,
} from "@/lib/org-navigation";
import type { Role } from "types";

export function CashierHomeDashboard({
  orgId,
  orgName,
  role,
}: {
  orgId: string;
  orgName: string;
  role: Role;
}) {
  const { user } = useAuth();
  const { items: statItems, invoiceList } = useCashierStats(orgId, role);

  const recentPreview = invoiceList.slice(0, 3);
  const hasActivity = invoiceList.length > 0;
  const salesUrl = orgSalesPath(orgId);
  const newSaleUrl = orgNewSalePath(orgId);
  const clientsUrl = orgClientsPath(orgId);

  return (
    <OrgPageShell className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="capitalize">
              Cashier home
            </Badge>
            <h1 className="dashboard-hero-title text-2xl font-bold tracking-tight sm:text-3xl">
              Hello, {user?.name?.split(" ")[0] ?? "there"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Shift overview for <strong>{orgName}</strong>. Record sales,
              manage customers, and track today&apos;s revenue.
            </p>
          </div>
          <Button asChild className="auth-submit-btn shrink-0 gap-2 border-0">
            <Link to={newSaleUrl}>
              <Plus className="size-4" />
              New sale
            </Link>
          </Button>
        </div>

        <DashboardQuickActions orgId={orgId} role={role} />

        {statItems.length > 0 && (
          <ProductStatsGrid
            items={statItems}
            className="min-[480px]:grid-cols-2 laptop:grid-cols-4"
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card/90 to-blue-500/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="size-5 text-violet-600" />
                Sales workspace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create invoices, scan products, record payments, and browse sales
                history.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" className="auth-submit-btn border-0">
                  <Link to={newSaleUrl}>
                    <Plus className="size-3.5" />
                    New sale
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={salesUrl}>
                    All invoices
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card/90 to-teal-500/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserRound className="size-5 text-emerald-600" />
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add or search customers before attaching them to a sale.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link to={clientsUrl}>
                  Manage customers
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {!hasActivity && <DashboardEmptyHint orgId={orgId} role={role} />}

        {hasActivity && (
          <Card className="border-violet-500/15 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Latest activity</CardTitle>
              <Link
                to={salesUrl}
                className="text-xs font-medium text-violet-600 hover:underline"
              >
                View all in Sales
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentPreview.map((inv) => (
                <Link
                  key={inv.id}
                  to={orgInvoicePath(orgId, inv.id)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      #{inv.number} · {inv.customer_name || "Walk-in"}
                    </p>
                    <p className="text-xs text-muted-foreground">{inv.status}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatDisplayAmount(inv.total)}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
    </OrgPageShell>
  );
}
