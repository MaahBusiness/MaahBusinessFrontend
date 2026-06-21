import {
  BarChart3,
  CreditCard,
  DollarSign,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatDisplayAmount } from "utils";
import type { DashboardInsights, DashboardSummary } from "@/lib/dashboard-types";
import { cn } from "@/lib/utils";

type MetricItem = {
  label: string;
  value: string;
  sub?: string;
  icon: typeof DollarSign;
  className: string;
};

export function PeriodPerformanceStrip({
  summary,
  insights,
}: {
  summary: DashboardSummary;
  insights: DashboardInsights;
}) {
  const { totals, sales_performance: perf } = insights;
  const marginPct = Number(summary.profit.profit_margin_percentage);

  const metrics: MetricItem[] = [
    {
      label: "Period revenue",
      value: formatDisplayAmount(totals.total_revenue),
      sub: `${totals.total_sales} orders`,
      icon: DollarSign,
      className: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
    {
      label: "Paid sales",
      value: formatDisplayAmount(perf.complete_revenue),
      sub: `${formatDisplayAmount(perf.credit_revenue)} on credit`,
      icon: Receipt,
      className: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    {
      label: "Gross profit",
      value: formatDisplayAmount(totals.gross_profit),
      sub: `${marginPct.toFixed(1)}% margin`,
      icon: TrendingUp,
      className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Net profit",
      value: formatDisplayAmount(totals.net_profit),
      sub: `Sales profit ${formatDisplayAmount(perf.profit)}`,
      icon: BarChart3,
      className: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    },
    {
      label: "Expenses",
      value: formatDisplayAmount(totals.total_expenses),
      sub: `${formatDisplayAmount(summary.expenses.salary_expenses)} salaries`,
      icon: Wallet,
      className: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    },
    {
      label: "Credit outstanding",
      value: formatDisplayAmount(totals.credit_outstanding),
      sub: `${formatDisplayAmount(summary.customers.overdue_credit_amount)} overdue`,
      icon: CreditCard,
      className: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/70 p-4 backdrop-blur-sm">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Period performance
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cn(
              "flex items-start gap-2.5 rounded-xl border px-3 py-2.5",
              m.className,
            )}
          >
            <m.icon className="mt-0.5 size-4 shrink-0 opacity-80" />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium uppercase tracking-wide opacity-80">
                {m.label}
              </p>
              <p className="text-base font-bold leading-tight">{m.value}</p>
              {m.sub && (
                <p className="mt-0.5 truncate text-[10px] opacity-75">{m.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
