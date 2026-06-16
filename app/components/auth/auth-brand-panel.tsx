import { BarChart3, Package, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router";
import { SITE_NAME } from "types/consts";

const features = [
  {
    icon: Package,
    color: "from-blue-500/30 to-cyan-500/20",
    iconColor: "text-blue-200",
    title: "Inventory in real time",
    description: "Track stock, movements, and low-stock alerts across locations.",
  },
  {
    icon: BarChart3,
    color: "from-violet-500/30 to-purple-500/20",
    iconColor: "text-violet-200",
    title: "Sales & analytics",
    description: "Invoices, payments, and dashboards that reflect your business.",
  },
  {
    icon: ShieldCheck,
    color: "from-emerald-500/30 to-green-500/20",
    iconColor: "text-emerald-200",
    title: "Secure team access",
    description: "Role-based permissions for owners, managers, and cashiers.",
  },
];

export function AuthBrandPanel() {
  return (
    <div className="auth-brand-panel relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14">
      <div className="relative z-10">
        <Link
          to="/"
          className="auth-brand-logo inline-flex items-center gap-3 text-white/95 transition-all duration-300 hover:scale-[1.02] hover:opacity-100"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 shadow-lg shadow-black/10 ring-1 ring-white/25 backdrop-blur-md">
            <Zap className="size-5 text-amber-300" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">{SITE_NAME}</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-md space-y-10">
        <div className="auth-brand-headline space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Trusted by modern retailers
          </span>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-[2.35rem] xl:leading-[1.15]">
            Run your retail business with{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
              confidence
            </span>
          </h2>
          <p className="text-base leading-relaxed text-white/70">
            One platform for stock, sales, teams, and insights — built for modern
            retailers.
          </p>
        </div>

        <ul className="space-y-4">
          {features.map(({ icon: Icon, color, iconColor, title, description }, i) => (
            <li
              key={title}
              className="auth-feature-item flex gap-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:ring-white/20"
              style={{ animationDelay: `${400 + i * 120}ms` }}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} ring-1 ring-white/15`}
              >
                <Icon className={`size-5 ${iconColor}`} strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm leading-relaxed text-white/60">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-sm text-white/40">
        &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </p>

      {/* Animated orbs */}
      <div aria-hidden className="auth-brand-orb auth-brand-orb-1" />
      <div aria-hidden className="auth-brand-orb auth-brand-orb-2" />
      <div aria-hidden className="auth-brand-orb auth-brand-orb-3" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-60"
      />
    </div>
  );
}
