import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

const ACCENTS = {
  violet: {
    bg: "from-violet-600/20 via-violet-500/5 to-transparent",
    border: "border-violet-500/25",
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    value: "text-violet-700 dark:text-violet-300",
  },
  blue: {
    bg: "from-blue-600/20 via-cyan-500/5 to-transparent",
    border: "border-blue-500/25",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    value: "text-blue-700 dark:text-blue-300",
  },
  emerald: {
    bg: "from-emerald-600/20 via-green-500/5 to-transparent",
    border: "border-emerald-500/25",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  orange: {
    bg: "from-orange-600/20 via-amber-500/5 to-transparent",
    border: "border-orange-500/25",
    icon: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    value: "text-orange-700 dark:text-orange-300",
  },
  rose: {
    bg: "from-rose-600/20 via-pink-500/5 to-transparent",
    border: "border-rose-500/25",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    value: "text-rose-700 dark:text-rose-300",
  },
  cyan: {
    bg: "from-cyan-600/20 via-teal-500/5 to-transparent",
    border: "border-cyan-500/25",
    icon: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    value: "text-cyan-700 dark:text-cyan-300",
  },
} as const;

export type KpiAccent = keyof typeof ACCENTS;

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  accent?: KpiAccent;
  trend?: { value: string; positive?: boolean };
  footer?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "violet",
  trend,
  footer,
  className,
}: KpiCardProps) {
  const style = ACCENTS[accent];

  return (
    <div
      className={cn(
        "kpi-card group relative overflow-hidden rounded-2xl border bg-card/70 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        style.border,
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          style.bg,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className={cn("text-2xl font-bold tracking-tight", style.value)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                trend.positive
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-400",
              )}
            >
              {trend.positive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {trend.value}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            style.icon,
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </div>
      </div>
      {footer && <div className="relative mt-4">{footer}</div>}
    </div>
  );
}
