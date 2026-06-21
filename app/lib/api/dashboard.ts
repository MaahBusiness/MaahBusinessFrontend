import type { QueryClient } from "@tanstack/react-query";
import type {
  DashboardDateFilters,
  DashboardInsights,
  DashboardSummary,
} from "@/lib/dashboard-types";
import { apiClient } from "@/lib/api-client";
import { organisationKeys } from "@/lib/api/organisation";
import { invalidateOrgInventory } from "@/lib/api/inventory";
import { DASHBOARD_URL } from "utils/endpoints";

const buildDateQuery = (businessId: string, filters?: DashboardDateFilters) => {
  const params = new URLSearchParams({ business_id: businessId });
  if (filters?.start_date) params.set("start_date", filters.start_date);
  if (filters?.end_date) params.set("end_date", filters.end_date);
  return params.toString();
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  org: (orgId: string) => [...dashboardKeys.all, orgId] as const,
  summary: (orgId: string, filters?: DashboardDateFilters) =>
    [...dashboardKeys.org(orgId), "summary", { filters }] as const,
  insights: (orgId: string, filters?: DashboardDateFilters) =>
    [...dashboardKeys.org(orgId), "insights", { filters }] as const,
};

export const dashboardApi = {
  getSummary: (token: string, businessId: string, filters?: DashboardDateFilters) =>
    apiClient.get<DashboardSummary>(
      `${DASHBOARD_URL}summary/?${buildDateQuery(businessId, filters)}`,
      token,
    ),
  getInsights: (token: string, businessId: string, filters?: DashboardDateFilters) =>
    apiClient.get<DashboardInsights>(
      `${DASHBOARD_URL}insights/?${buildDateQuery(businessId, filters)}`,
      token,
    ),
};

/** Invalidate owner dashboard summary, insights, and notifications for an org. */
export function invalidateOrgDashboard(
  queryClient: QueryClient,
  orgId: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: dashboardKeys.org(orgId) }),
    queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  ]);
}

/** Refetch all dashboard views (owner analytics + staff/cashier KPI sources). */
export function invalidateOrgDashboardViews(
  queryClient: QueryClient,
  orgId: string,
) {
  return Promise.all([
    invalidateOrgDashboard(queryClient, orgId),
    invalidateOrgInventory(queryClient, orgId),
    queryClient.invalidateQueries({ queryKey: organisationKeys.invoices(orgId) }),
    queryClient.invalidateQueries({ queryKey: organisationKeys.products(orgId) }),
    queryClient.invalidateQueries({
      queryKey: [...organisationKeys.detail(orgId), "clients"],
    }),
    queryClient.invalidateQueries({ queryKey: organisationKeys.members(orgId) }),
  ]);
}
