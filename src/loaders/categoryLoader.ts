import { redirect } from "react-router-dom";
import { categoryService, authService } from "../services";
import type { User, Category, Subcategory } from "../types";

export interface CategoryLoaderData {
  user: User | null;
  categories: Category[];
  subcategories: Subcategory[];
  error?: string;
}

/**
 * Loader for Category page - fetches categories and subcategories
 */
export async function categoryLoader(): Promise<CategoryLoaderData | Response> {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  try {
    // Verify auth and fetch user
    const user = await authService.getUserInfo();
    localStorage.setItem("user", JSON.stringify(user));

    // Fetch categories and subcategories in parallel
    const [categoriesRes, subcategoriesRes] = await Promise.all([
      categoryService.getCategories(),
      categoryService.getSubcategories(),
    ]);

    return {
      user,
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

    const cachedUser = localStorage.getItem("user");
    return {
      user: cachedUser ? JSON.parse(cachedUser) : null,
      categories: [],
      subcategories: [],
      error: (error as Error).message,
    };
  }
}

