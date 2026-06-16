import { Link } from "react-router";
import {
  FileBarChart,
  PackagePlus,
  Receipt,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "New sale",
    desc: "Create invoice",
    icon: Receipt,
    href: (id: string) => `/dashboard/org/${id}/invoices`,
    gradient: "from-violet-600 to-indigo-600",
    shadow: "shadow-violet-500/25",
  },
  {
    label: "Add product",
    desc: "Expand catalog",
    icon: PackagePlus,
    href: (id: string) => `/dashboard/org/${id}/products`,
    gradient: "from-blue-600 to-cyan-600",
    shadow: "shadow-blue-500/25",
  },
  {
    label: "Clients",
    desc: "Manage customers",
    icon: UserPlus,
    href: (id: string) => `/dashboard/org/${id}/clients`,
    gradient: "from-emerald-600 to-teal-600",
    shadow: "shadow-emerald-500/25",
  },
  {
    label: "Inventory",
    desc: "Stock levels",
    icon: Warehouse,
    href: (id: string) => `/dashboard/org/${id}/inventory`,
    gradient: "from-orange-600 to-amber-600",
    shadow: "shadow-orange-500/25",
  },
  {
    label: "Team",
    desc: "Members & roles",
    icon: Users,
    href: (id: string) => `/dashboard/org/${id}/team`,
    gradient: "from-rose-600 to-pink-600",
    shadow: "shadow-rose-500/25",
  },
  {
    label: "Reports",
    desc: "Export PDF",
    icon: FileBarChart,
    href: (id: string) => `/dashboard/org/${id}?tab=reports`,
    gradient: "from-fuchsia-600 to-purple-600",
    shadow: "shadow-fuchsia-500/25",
  },
] as const;

export function DashboardQuickActions({ orgId }: { orgId: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {actions.map((action) => (
        <Link
          key={action.label}
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
