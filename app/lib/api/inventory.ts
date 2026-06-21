import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Product } from "types";
import { INVENTORY_URL } from "utils/endpoints";

export const inventoryKeys = {
  all: ["inventory"] as const,
  org: (orgId: string) => [...inventoryKeys.all, orgId] as const,
  lowStock: (orgId: string) => [...inventoryKeys.org(orgId), "low-stock"] as const,
  expired: (orgId: string) => [...inventoryKeys.org(orgId), "expired"] as const,
};

/** Invalidate low-stock and expired inventory alerts for an org. */
export function invalidateOrgInventory(
  queryClient: QueryClient,
  orgId: string,
) {
  return queryClient.invalidateQueries({ queryKey: inventoryKeys.org(orgId) });
}

type StockMovementType = "ENTRY" | "EXIT" | "ADJUSTMENT";

export type StockMovementCreateParams = {
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  reason?: string;
};

export const inventoryApi = {
  getLowStockProducts: (token: string, businessId: string) =>
    apiClient.get<Product[]>(`${INVENTORY_URL}${businessId}/products/low-stock/`, token),
  getExpiredProducts: (token: string, businessId: string) =>
    apiClient.get<Product[]>(`${INVENTORY_URL}${businessId}/products/expired/`, token),
  createStockMovement: (
    token: string,
    businessId: string,
    payload: StockMovementCreateParams,
  ) =>
    apiClient.post(`${INVENTORY_URL}${businessId}/stock-movements/`, token, payload),
  checkLowStock: (token: string, businessId: string) =>
    apiClient.post(`${INVENTORY_URL}${businessId}/products/check-low-stock/`, token),
  checkExpired: (token: string, businessId: string) =>
    apiClient.post(`${INVENTORY_URL}${businessId}/products/check-expired/`, token),
};
