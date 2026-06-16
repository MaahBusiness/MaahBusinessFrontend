import { apiClient } from "@/lib/api-client";
import type { Product } from "types";
import { INVENTORY_URL } from "utils/endpoints";

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
