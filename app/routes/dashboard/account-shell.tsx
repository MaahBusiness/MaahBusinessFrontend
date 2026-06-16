import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function AccountShell() {
  return (
    <div className="flex min-h-[calc(100svh-var(--header-height))] flex-1">
      <DashboardSidebar />
      <SidebarInset className="dashboard-shell-inset relative flex-1 overflow-x-hidden">
        <Outlet />
      </SidebarInset>
    </div>
  );
}
