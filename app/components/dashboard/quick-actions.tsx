import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { ORG_QUICK_ACTIONS } from "@/lib/org-navigation";
import { filterByRole } from "@/lib/dashboard-widgets";
import type { Role } from "types";

export function DashboardQuickActions({
  orgId,
  role,
  excludeIds = [],
}: {
  orgId: string;
  role?: Role;
  excludeIds?: string[];
}) {
  const visible = filterByRole(role, ORG_QUICK_ACTIONS).filter(
    (action) => !excludeIds.includes(action.id),
  );

  if (!visible.length) return null;

  return (
    <div
      className={cn(
        "grid gap-3",
        visible.length === 1 && "grid-cols-1",
        visible.length === 2 && "grid-cols-2",
        visible.length >= 3 && "grid-cols-2 sm:grid-cols-3",
        visible.length >= 5 && "xl:grid-cols-6",
      )}
    >
      {visible.map((action) => (
        <Link
          key={action.id}
          to={action.href(orgId)}
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-white/10 p-4 text-white transition-all duration-300",
            "hover:-translate-y-1 hover:shadow-lg",
            action.shadow,
            `bg-gradient-to-br ${action.gradient}`,
          )}
        >
          <div className="relative z-10 flex flex-col gap-2">
            <action.icon className="size-5 opacity-90" strokeWidth={2} />
            <div>
              <p className="text-sm font-semibold leading-tight">{action.label}</p>
              <p className="text-[11px] text-white/75">{action.desc}</p>
            </div>
          </div>
          <div
            aria-hidden
            className="absolute -right-3 -top-3 size-16 rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-150"
          />
        </Link>
      ))}
    </div>
  );
}
