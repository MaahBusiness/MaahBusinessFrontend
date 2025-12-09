import api from "./api";
import type {
  Category,
  Subcategory,
  Product,
  PaginatedResponse,
} from "../types";

export const categoryService = {
  // Categories
  async getCategories(): Promise<PaginatedResponse<Category>> {
    const response = await api.get<PaginatedResponse<Category>>(
      "/categories/categories/",
    );
    return response.data;
  },

  async getCategoryDetail(categoryId: string): Promise<Category> {
    const response = await api.get<Category>(
      `/categories/${categoryId}/category/detail/`,
    );
    return response.data;
  },

  async createCategory(categoryData: Omit<Category, "id">): Promise<Category> {
    const response = await api.post<Category>(
      "/categories/category/create/",
      categoryData,
    );
    return response.data;
  },

  async updateCategory(
    categoryId: string,
    categoryData: Partial<Category>,
  ): Promise<Category> {
    const response = await api.put<Category>(
      `/categories/${categoryId}/category/update/`,
      categoryData,
    );
    return response.data;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await api.delete(`/categories/${categoryId}/category/delete/`);
  },

  async getCategoryProducts(
    categoryId: string,
  ): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>(
      "/categories/products/",
      {
        params: { category_id: categoryId },
      },
    );
    return response.data;
  },

  // Subcategories
  async getSubcategories(): Promise<PaginatedResponse<Subcategory>> {
    const response = await api.get<PaginatedResponse<Subcategory>>(
      "/categories/subcategories/",
    );
    return response.data;
  },

  async getSubcategoryDetail(subcategoryId: string): Promise<Subcategory> {
    const response = await api.get<Subcategory>(
      `/categories/${subcategoryId}/subcategory/detail/`,
    );
    return response.data;
  },

  async createSubcategory(
    subcategoryData: Omit<Subcategory, "id">,
  ): Promise<Subcategory> {
    const response = await api.post<Subcategory>(
      "/categories/subcategory/create/",
      subcategoryData,
    );
    return response.data;
  },

  async updateSubcategory(
    subcategoryId: string,
    subcategoryData: Partial<Subcategory>,
  ): Promise<Subcategory> {
    const response = await api.put<Subcategory>(
      `/categories/${subcategoryId}/subcategory/update/`,
      subcategoryData,
    );
    return response.data;
  },

  async deleteSubcategory(subcategoryId: string): Promise<void> {
    await api.delete(`/categories/${subcategoryId}/subcategory/delete/`);
  },

  async getSubcategoryProducts(
    subcategoryId: string,
  ): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>(
      "/categories/sub/products/",
      {
        params: { subcategory_id: subcategoryId },
      },
    );
    return response.data;
  },
};

export default categoryService;
