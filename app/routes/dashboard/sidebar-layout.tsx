import { AppSidebar } from "@/components/app-sidebar";
import { QueryHydration } from "@/components/layout/query-hydration";
import { useOrganisation } from "@/hooks/use-organisation";
import {
  getOrgRoutePermission,
  getPermissionFallbackPath,
} from "@/lib/org-navigation";
import {
  createOrgPrefetchLoader,
  prefetchOrgCoreData,
} from "@/lib/query.server";
import { SidebarInset } from "@/components/ui/sidebar";
import type { Route } from ".react-router/types/app/routes/dashboard/+types/sidebar-layout";
import { Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { matchesAnyPermission, normalizeRole } from "utils/permissions";
import { useEffect } from "react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const orgId = params.id;
  return createOrgPrefetchLoader(request, orgId, prefetchOrgCoreData);
}

/**
 * Always render <Outlet /> so client-side navigation completes immediately.
 * Redirect unauthorized access in an effect (never replace Outlet with Navigate).
 */
function OrgPermissionGuard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { id: orgId } = useParams();
  const { businessMember, isLoading, isMembersLoading, organisation } =
    useOrganisation();

  const membershipReady = !isLoading && !isMembersLoading;
  const role = normalizeRole(businessMember?.role);

  useEffect(() => {
    if (!membershipReady) return;

    if (organisation?.success && !businessMember) {
      navigate("/dashboard/organisations", { replace: true });
      return;
    }

    const required = getOrgRoutePermission(pathname);
    if (required && role && !matchesAnyPermission(role, required)) {
      navigate(getPermissionFallbackPath(orgId, role), { replace: true });
    }
  }, [
    membershipReady,
    organisation?.success,
    businessMember,
    role,
    pathname,
    orgId,
    navigate,
  ]);

  return <Outlet key={pathname} />;
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { businessMember, isLoading, isMembersLoading } = useOrganisation();

  if (
    !isLoading &&
    !isMembersLoading &&
    businessMember?.is_active === false
  ) {
    return <Navigate to="/dashboard/organisations" replace />;
  }

  return (
    <QueryHydration state={loaderData?.dehydratedState}>
      <div className="flex min-h-[calc(100svh-var(--header-height))] w-full min-w-0 flex-1">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1 overflow-x-hidden">
          <OrgPermissionGuard />
        </SidebarInset>
      </div>
    </QueryHydration>
  );
}
