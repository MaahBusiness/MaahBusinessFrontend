import { AppSidebar } from "@/components/app-sidebar";
import { useOrganisation } from "@/hooks/use-organisation";
import { getOrgRoutePermission } from "@/lib/sidebar-nav";
import { SidebarInset } from "@/components/ui/sidebar";
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { matchesAnyPermission } from "utils/permissions";

function OrgPermissionGuard() {
  const { pathname } = useLocation();
  const { id: orgId } = useParams();
  const { businessMember, isLoading } = useOrganisation();

  if (isLoading) return <Outlet />;

  const required = getOrgRoutePermission(pathname);
  if (
    required &&
    !matchesAnyPermission(businessMember?.role, required)
  ) {
    const canViewDashboard = matchesAnyPermission(businessMember?.role, [
      "dashboard:full",
      "dashboard:limited",
    ]);
    const fallback = canViewDashboard
      ? `/dashboard/org/${orgId}`
      : "/dashboard/organisations";

    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export default function Layout() {
  const { businessMember, isLoading } = useOrganisation();

  if (!isLoading && businessMember?.is_active === false) {
    return <Navigate to="/dashboard/organisations" replace />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          <OrgPermissionGuard />
        </SidebarInset>
      </div>
    </div>
  );
}
