import type {
  DashboardDateFilters,
  DashboardInsights,
  DashboardSummary,
} from "@/lib/dashboard-types";
import { apiClient } from "@/lib/api-client";
import { DASHBOARD_URL } from "utils/endpoints";

const buildDateQuery = (businessId: string, filters?: DashboardDateFilters) => {
  const params = new URLSearchParams({ business_id: businessId });
  if (filters?.start_date) params.set("start_date", filters.start_date);
  if (filters?.end_date) params.set("end_date", filters.end_date);
  return params.toString();
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
