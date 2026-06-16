import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const accents = {
  violet: "border-violet-500/25 bg-violet-500/5",
  blue: "border-blue-500/25 bg-blue-500/5",
  emerald: "border-emerald-500/25 bg-emerald-500/5",
  orange: "border-orange-500/25 bg-orange-500/5",
  amber: "border-amber-500/25 bg-amber-500/5",
  rose: "border-rose-500/25 bg-rose-500/5",
  cyan: "border-cyan-500/25 bg-cyan-500/5",
} as const;

const iconColors = {
  violet: "text-violet-600",
  blue: "text-blue-600",
  emerald: "text-emerald-600",
  orange: "text-orange-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
  cyan: "text-cyan-600",
} as const;

export function ProductFormSection({
  title,
  description,
  icon: Icon,
  accent = "violet",
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  accent?: keyof typeof accents;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        accents[accent],
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-background/80 shadow-sm",
            iconColors[accent],
          )}
        >
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
