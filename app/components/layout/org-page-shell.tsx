import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Orb = "violet" | "blue" | "emerald";

export function OrgPageShell({
  children,
  className,
  orbs = ["violet", "blue"],
}: {
  children: ReactNode;
  className?: string;
  orbs?: Orb[];
}) {
  return (
    <div className="dashboard-page relative flex min-h-full w-full min-w-0 flex-col overflow-x-hidden">
      {orbs.includes("violet") && (
        <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      )}
      {orbs.includes("blue") && (
        <div aria-hidden className="dashboard-orb dashboard-orb-blue" />
      )}
      {orbs.includes("emerald") && (
        <div aria-hidden className="dashboard-orb dashboard-orb-emerald" />
      )}
      <div
        className={cn(
          "relative z-10 flex w-full min-w-0 flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
