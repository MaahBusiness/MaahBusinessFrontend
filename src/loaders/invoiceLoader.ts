import { redirect, LoaderFunctionArgs } from "react-router-dom";
import { invoiceService, productService, authService } from "../services";
import type { User, Invoice, InvoiceStatus, PaginationInfo } from "../types";

interface ProcessedProduct {
  id: string;
  name: string;
  price: number;
  is_promotion: boolean;
  promotion_price: number;
}

export interface InvoiceLoaderData {
  user: User | null;
  isManager: boolean;
  invoices: Invoice[];
  products: ProcessedProduct[];
  validStatusValues: InvoiceStatus[];
  pagination: PaginationInfo;
  error?: string;
}

/**
 * Loader for Invoice page - fetches invoices and products
 */
export async function invoiceLoader({ request }: LoaderFunctionArgs): Promise<InvoiceLoaderData | Response> {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  // Get page from URL params
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  try {
    // Verify auth and fetch user
    const user = await authService.getUserInfo();
    localStorage.setItem("user", JSON.stringify(user));

    // Fetch invoices and products in parallel
    const [invoicesRes, productsRes] = await Promise.all([
      invoiceService.getInvoices(page),
      productService.getProducts(),
    ]);

    // Process products for invoice creation
    const products: ProcessedProduct[] = (productsRes.results || [])
      .map((item) => {
        const productInfo = item.product || item;
        const isPromotion =
          ((productInfo as Record<string, unknown>).is_promotion ||
            (productInfo as Record<string, unknown>).on_promotion) &&
          (productInfo as Record<string, unknown>).promotion_active !== false;

        return {
          id: String(productInfo.id || ""),
          name: productInfo.name || "Unnamed Product",
          price: productInfo.unit_price || 0,
          is_promotion: Boolean(isPromotion),
          promotion_price: isPromotion
            ? Number((productInfo as Record<string, unknown>).promotion_price || (productInfo as Record<string, unknown>).promo_price || 0)
            : 0,
        };
      })
      .filter((p) => p.id);

    // Extract valid status values
    const invoiceData = Array.isArray(invoicesRes) ? invoicesRes : invoicesRes.results || [];
    const validStatusValues = [...new Set(invoiceData.map((inv) => inv.status).filter(Boolean))] as InvoiceStatus[];

    return {
      user,
      isManager: user.role === "manager",
      invoices: invoiceData,
      products,
      validStatusValues,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((invoicesRes.count || 0) / 10),
        totalItems: invoicesRes.count || 0,
      },
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
      invoices: [],
      products: [],
      validStatusValues: [],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
      error: (error as Error).message,
    };
  }
}

export interface ArchivedInvoicesLoaderData {
  user: User;
  invoices: Invoice[];
  pagination: PaginationInfo;
}

/**
 * Loader for archived invoices (manager only)
 */
export async function archivedInvoicesLoader({ request }: LoaderFunctionArgs): Promise<ArchivedInvoicesLoaderData | Response> {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  try {
    const user = await authService.getUserInfo();
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role !== "manager") {
      return redirect("/");
    }

    const archivedRes = await invoiceService.getArchivedInvoices(page);

    return {
      user,
      invoices: archivedRes.results || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((archivedRes.count || 0) / 10),
        totalItems: archivedRes.count || 0,
      },
    };
  } catch (error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      return redirect("/login");
    }
    throw error;
  }
}

