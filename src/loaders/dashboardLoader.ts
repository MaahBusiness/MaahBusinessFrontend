import { redirect, LoaderFunctionArgs } from "react-router-dom";
import { dashboardService, authService } from "../services";
import type { User, DashboardStats, InventoryData, ProductPerformance, SalesDataPoint, RecentSale } from "../types";

export interface DashboardLoaderData {
  user: User | null;
  isManager: boolean;
  hasReportAccess: boolean;
  dateRange: { startDate: string; endDate: string };
  inventoryData: InventoryData;
  productPerformance: ProductPerformance;
  salesData: SalesDataPoint[];
  dashboardStats: DashboardStats;
  recentSales: RecentSale[];
  error?: string;
}

/**
 * Loader for Dashboard page
 */
export async function dashboardLoader({ request }: LoaderFunctionArgs): Promise<DashboardLoaderData | Response> {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  // Get date range from URL params or use defaults
  const url = new URL(request.url);
  const endDate = url.searchParams.get("end_date") || new Date().toISOString().split("T")[0];
  const startDate =
    url.searchParams.get("start_date") ||
    (() => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date.toISOString().split("T")[0];
    })();

  try {
    // Verify auth and fetch user
    const user = await authService.getUserInfo();
    localStorage.setItem("user", JSON.stringify(user));

    const isManager = user.role === "manager";
    const isCashier = user.role === "cashier";
    const hasReportAccess = isManager || isCashier;

    // Only fetch data if user has permission
    if (!isManager) {
      return {
        user,
        isManager,
        hasReportAccess,
        dateRange: { startDate, endDate },
        inventoryData: { stockStatus: [], stockData: [], alerts: {} },
        productPerformance: { top_products: [], top_categories: [] },
        salesData: [],
        dashboardStats: createEmptyStats(),
        recentSales: [],
      };
    }

    // Fetch all dashboard data in parallel
    const [inventoryData, productPerformance, salesData, dashboardStatsRaw, recentSales] = await Promise.all([
      dashboardService.getInventoryData().catch(() => ({ stockStatus: [], stockData: [], alerts: {} })),
      dashboardService.getTopSalesProducts(startDate, endDate).catch(() => ({ top_products: [], top_categories: [] })),
      dashboardService.getSalesData(startDate, endDate).catch(() => []),
      dashboardService.getDashboardStats(startDate, endDate).catch(() => []),
      dashboardService.getRecentSales(10).catch(() => []),
    ]);

    return {
      user,
      isManager,
      hasReportAccess,
      dateRange: { startDate, endDate },
      inventoryData,
      productPerformance,
      salesData,
      dashboardStats: processStatsData(dashboardStatsRaw as Record<string, unknown>[]),
      recentSales: Array.isArray(recentSales) ? recentSales : [recentSales],
    };
  } catch (error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/login");
    }

    const cachedUser = localStorage.getItem("user");
    return {
      user: cachedUser ? JSON.parse(cachedUser) : null,
      isManager: false,
      hasReportAccess: false,
      dateRange: { startDate, endDate },
      inventoryData: { stockStatus: [], stockData: [], alerts: {} },
      productPerformance: { top_products: [], top_categories: [] },
      salesData: [],
      dashboardStats: createEmptyStats(),
      recentSales: [],
      error: (error as Error).message,
    };
  }
}

function createEmptyStats(): DashboardStats {
  return {
    revenue: {
      total: 0,
      completed: 0,
      credit: { total: 0, advance_paid: 0, to_collect: 0, count: 0 },
      trend: { status: "up", percentage: 0 },
    },
    profit: { total: 0, completed: 0, credit: 0, trend: { status: "up", percentage: 0 } },
    orders: { total: 0, completed: 0, credit: 0, trend: { status: "up", percentage: 0 } },
    averageOrderValue: { value: 0, change: 0, change_percent: 0 },
  };
}

function processStatsData(rawData: Record<string, unknown>[]): DashboardStats {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return createEmptyStats();
  }

  const calculateTotal = (metric: string) =>
    rawData.reduce((sum, item) => sum + (Number(item[metric]) || 0), 0);
  const calculateCompleted = (metric: string) =>
    rawData.reduce((sum, item) => sum + (item.status === "completed" ? Number(item[metric]) || 0 : 0), 0);
  const calculateCredit = (metric: string) =>
    rawData.reduce((sum, item) => sum + (item.status === "credit" ? Number(item[metric]) || 0 : 0), 0);

  const totalRevenue = calculateTotal("revenue");
  const totalOrders = calculateTotal("orders");
  const totalProfit = calculateTotal("profit");

  return {
    revenue: {
      total: totalRevenue,
      completed: calculateCompleted("revenue"),
      credit: {
        total: calculateCredit("revenue"),
        advance_paid: rawData.reduce((sum, item) => sum + (Number(item.advance_paid) || 0), 0),
        to_collect: rawData.reduce(
          (sum, item) =>
            item.status === "credit" ? sum + ((Number(item.revenue) || 0) - (Number(item.advance_paid) || 0)) : sum,
          0
        ),
        count: rawData.filter((item) => item.status === "credit").length,
      },
      trend: { status: "up", percentage: 0 },
    },
    profit: {
      total: totalProfit,
      completed: calculateCompleted("profit"),
      credit: calculateCredit("profit"),
      trend: { status: "up", percentage: 0 },
    },
    orders: {
      total: totalOrders,
      completed: calculateCompleted("orders"),
      credit: calculateCredit("orders"),
      trend: { status: "up", percentage: 0 },
    },
    averageOrderValue: {
      value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      change: 0,
      change_percent: 0,
    },
  };
}

