import { AppSidebar } from "@/components/app-sidebar";
import { useOrganisation } from "@/hooks/use-organisation";
import {
  getOrgRoutePermission,
  getPermissionFallbackPath,
} from "@/lib/org-navigation";
import { SidebarInset } from "@/components/ui/sidebar";
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { matchesAnyPermission } from "utils/permissions";

function OrgPermissionGuard() {
  const { pathname } = useLocation();
  const { id: orgId } = useParams();
  const { businessMember, isLoading, organisation } = useOrganisation();

  if (isLoading) return <Outlet />;

  if (organisation?.success && !businessMember) {
    return <Navigate to="/dashboard/organisations" replace />;
  }

  const required = getOrgRoutePermission(pathname);
  if (
    required &&
    businessMember &&
    !matchesAnyPermission(businessMember.role, required)
  ) {
    return (
      <Navigate
        to={getPermissionFallbackPath(orgId, businessMember.role)}
        replace
      />
    );
  }

  return <Outlet />;
}

export default function Layout() {
  const { businessMember, isLoading } = useOrganisation();

  if (!isLoading && businessMember?.is_active === false) {
    return <Navigate to="/dashboard/organisations" replace />;
  }

  return (
    <div className="flex min-h-[calc(100svh-var(--header-height))] w-full min-w-0 flex-1">
      <AppSidebar />
      <SidebarInset className="min-w-0 flex-1 overflow-x-hidden">
        <OrgPermissionGuard />
      </SidebarInset>
    </div>
  );
}
