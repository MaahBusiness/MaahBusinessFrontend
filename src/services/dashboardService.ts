import api from "./api";
import type { InventoryData, ProductPerformance, SalesDataPoint, RecentSale } from "../types";

export const dashboardService = {
  async getInventoryData(): Promise<InventoryData> {
    const response = await api.get<InventoryData>("/dashboard/inventory/");
    return response.data;
  },

  async getTopSalesProducts(startDate: string, endDate: string): Promise<ProductPerformance> {
    const response = await api.get<ProductPerformance>("/dashboard/top-sales-products/", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  async getSalesData(startDate: string, endDate: string): Promise<SalesDataPoint[]> {
    const response = await api.get<SalesDataPoint[]>("/dashboard/sales/", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  async getDashboardStats(startDate: string, endDate: string): Promise<unknown[]> {
    const response = await api.get("/dashboard/stats/", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  async getRecentSales(limit = 10): Promise<RecentSale[]> {
    const response = await api.get<RecentSale[]>("/dashboard/recent-sales/", {
      params: { limit },
    });
    return response.data;
  },
};

export default dashboardService;
