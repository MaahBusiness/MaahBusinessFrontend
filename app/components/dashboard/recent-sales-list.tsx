import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayAmount } from "utils";
import type { DashboardInsights } from "@/lib/dashboard-types";
import { format, parseISO } from "date-fns";
import { Link } from "react-router";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CREDIT: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  CANCELLED: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

export function DashboardRecentSales({
  sales,
  orgId,
}: {
  sales: DashboardInsights["recent_sales"];
  orgId: string;
}) {
  return (
    <Card className="border-violet-500/15 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent sales</CardTitle>
        <CardDescription>Latest invoices from your business</CardDescription>
      </CardHeader>
      <CardContent>
        {!sales.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No sales recorded for this period.
          </p>
        ) : (
          <div className="space-y-4">
            {sales.slice(0, 8).map((sale) => {
              const name = sale.customer_name || "Walk-in customer";
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <Link
                  key={sale.invoice_id}
                  to={`/dashboard/org/${orgId}/invoices/${sale.invoice_id}`}
                  className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-violet-500/20 hover:bg-violet-500/5"
                >
                  <Avatar className="size-9 ring-2 ring-violet-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      #{sale.invoice_number} ·{" "}
                      {format(parseISO(sale.created_at), "MMM d, HH:mm")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatDisplayAmount(sale.total)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={STATUS_STYLES[sale.status] || ""}
                    >
                      {sale.status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
