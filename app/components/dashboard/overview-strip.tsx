import { CheckCircle2, Clock, CreditCard, Users, Zap } from "lucide-react";
import { formatDisplayAmount } from "utils";
import type { DashboardSummary } from "@/lib/dashboard-types";
import { cn } from "@/lib/utils";

export function DashboardOverviewStrip({
  summary,
}: {
  summary: DashboardSummary;
}) {
  const { overview } = summary;
  const cancelled =
    overview.total_invoices -
    overview.total_invoices_completed -
    overview.total_invoices_credit;

  const pills = [
    {
      label: "Completed",
      value: overview.total_invoices_completed,
      icon: CheckCircle2,
      className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "On credit",
      value: overview.total_invoices_credit,
      icon: CreditCard,
      className: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
    {
      label: "Cancelled",
      value: Math.max(0, cancelled),
      icon: Clock,
      className: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    },
  ];

  const lifetime = [
    { label: "Lifetime revenue", value: formatDisplayAmount(overview.lifetime_revenue) },
    { label: "Lifetime profit", value: formatDisplayAmount(overview.lifetime_profit) },
    { label: "Team", value: `${overview.active_members}/${overview.total_members} active` },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-card/80 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <Zap className="size-3.5 text-violet-600" />
          {overview.total_invoices} total invoices
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-card/80 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <Users className="size-3.5 text-blue-600" />
          {overview.total_categories} categories · {overview.total_products} products
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-card/70 p-4 backdrop-blur-sm">
          <p className="mb-1 w-full text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Invoice status
          </p>
          {pills.map((pill) => (
            <div
              key={pill.label}
              className={cn(
                "flex min-w-[100px] flex-1 items-center gap-2 rounded-xl border px-3 py-2",
                pill.className,
              )}
            >
              <pill.icon className="size-4 shrink-0" />
              <div>
                <p className="text-lg font-bold leading-none">{pill.value}</p>
                <p className="text-[10px] font-medium opacity-80">{pill.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/50 bg-card/70 p-4 backdrop-blur-sm">
          {lifetime.map((item) => (
            <div key={item.label} className="text-center sm:text-left">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
