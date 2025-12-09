import { redirect } from "react-router-dom";
import { productService, categoryService, authService } from "../services";
import type { User, ProductListItem, Category, Subcategory } from "../types";

export interface ProductsLoaderData {
  user: User | null;
  hasAccess: boolean;
  products: ProductListItem[];
  categories: Category[];
  subcategories: Subcategory[];
  error?: string;
}

/**
 * Loader for Products page - fetches products, categories, and subcategories
 */
export async function productsLoader(): Promise<ProductsLoaderData | Response> {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  try {
    // Verify auth and fetch user
    const user = await authService.getUserInfo();
    localStorage.setItem("user", JSON.stringify(user));

    // Check access
    const allowedRoles = ["manager", "cashier", "stock_keeper", "wholesale_client", "sales_agent"];
    if (!user.role || !allowedRoles.includes(user.role.toLowerCase())) {
      return { user, hasAccess: false, products: [], categories: [], subcategories: [] };
    }

    // Fetch all data in parallel
    const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
      productService.getProducts(),
      categoryService.getCategories(),
      categoryService.getSubcategories(),
    ]);

    return {
      user,
      hasAccess: true,
      products: productsRes.results || [],
      categories: categoriesRes.results || [],
      subcategories: subcategoriesRes.results || [],
    };
  } catch (error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/login");
    }

    // Return empty data on error
    const cachedUser = localStorage.getItem("user");
    return {
      user: cachedUser ? JSON.parse(cachedUser) : null,
      hasAccess: false,
      products: [],
      categories: [],
      subcategories: [],
      error: (error as Error).message,
    };
  }
}

