import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductStatItem = {
  label: string;
  value: React.ReactNode;
  accent: "violet" | "emerald" | "orange" | "rose";
  icon: LucideIcon;
  hint?: string;
};

const accentStyles = {
  violet: "border-violet-500/20 bg-violet-500/5 text-violet-600",
  emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600",
  orange: "border-orange-500/20 bg-orange-500/5 text-orange-600",
  rose: "border-rose-500/20 bg-rose-500/5 text-rose-600",
} as const;

export function ProductStatsGrid({
  items,
  className,
}: {
  items: ProductStatItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 laptop:grid-cols-4 laptop:gap-3",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "min-w-0 overflow-hidden rounded-xl border p-3 tablet:p-4",
            accentStyles[item.accent],
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <item.icon className="size-4 shrink-0" />
            <span className="truncate text-[10px] font-semibold uppercase tracking-wider">
              {item.label}
            </span>
          </div>
          <p
            className="mt-1.5 truncate text-base font-bold tabular-nums tablet:text-lg laptop:text-xl"
            title={typeof item.value === "string" ? item.value : undefined}
          >
            {item.value}
          </p>
          {item.hint && (
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {item.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
