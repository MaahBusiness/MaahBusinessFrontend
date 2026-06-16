import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  PackageX,
  Percent,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDisplayAmount } from "utils";
import type { DashboardSummary } from "@/lib/dashboard-types";
import { cn } from "@/lib/utils";

export function InventoryAlerts({
  inventory,
  orgId,
}: {
  inventory: DashboardSummary["inventory"];
  orgId: string;
}) {
  const alerts = [
    {
      label: "Low stock",
      value: inventory.low_stock_products,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
      href: `products?low_stock_only=true`,
    },
    {
      label: "Expired",
      value: inventory.expired_products,
      icon: PackageX,
      color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
      href: `products?expired_only=true`,
    },
    {
      label: "On promotion",
      value: inventory.products_on_promotion,
      icon: Tag,
      color: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
      href: `products`,
    },
  ];

  return (
    <Card className="border-rose-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Inventory health</CardTitle>
        <Link to={`/dashboard/org/${orgId}/inventory`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            View <ArrowRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stock value</span>
            <Percent className="size-3.5 text-emerald-600" />
          </div>
          <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatDisplayAmount(inventory.total_inventory_value)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {inventory.total_products} products tracked
          </p>
        </div>

        {alerts.map((alert) => (
          <Link
            key={alert.label}
            to={`/dashboard/org/${orgId}/${alert.href}`}
            className={cn(
              "flex items-center justify-between rounded-xl border p-3 transition-colors hover:opacity-90",
              alert.color,
            )}
          >
            <div className="flex items-center gap-2">
              <alert.icon className="size-4" />
              <span className="text-sm font-medium">{alert.label}</span>
            </div>
            <span className="text-lg font-bold">{alert.value}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
