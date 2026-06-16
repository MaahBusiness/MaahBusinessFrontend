import { apiClient } from "@/lib/api-client";
import type {
  Category,
  Product,
  ProductCreateParams,
  ProductFilters,
  ProductUpdateParams,
  Subcategory,
} from "types";
import { buildQueryParams } from "utils";
import {
  BUSINESS_URL,
  CATEGORY_URL,
  INVENTORY_CO_URL,
  PRODUCTS_URL,
  SUBCATEGORY_URL,
} from "utils/endpoints";

export const productsApi = {
  getFiltered: (token: string, businessId: string, filters?: ProductFilters) => {
    const query = buildQueryParams({ business_id: businessId, ...filters });
    return apiClient.get<Product[]>(`${PRODUCTS_URL}${query}`, token);
  },
  getById: (token: string, id: string) => apiClient.get<Product>(PRODUCTS_URL + id, token),
  create: (token: string, businessId: string, data: ProductCreateParams) =>
    apiClient.post<Product>(PRODUCTS_URL + "?business_id=" + businessId, token, data),
  update: (token: string, id: string, data: Partial<ProductUpdateParams>) =>
    apiClient.put<Product>(PRODUCTS_URL + id, token, data),
  remove: (token: string, id: string) => apiClient.delete<Product>(PRODUCTS_URL + id, token),
  addCategory: (
    token: string,
    businessId: string,
    data: { name: string; description?: string },
  ) =>
    apiClient.post<Category>(
      INVENTORY_CO_URL + BUSINESS_URL + businessId + CATEGORY_URL,
      token,
      data,
    ),
  addSubcategory: (
    token: string,
    businessId: string,
    data: { name: string; description?: string; category_id: string },
  ) =>
    apiClient.post<Subcategory>(
      INVENTORY_CO_URL + BUSINESS_URL + businessId + SUBCATEGORY_URL,
      token,
      data,
    ),
  updateCategory: (token: string, id: string, data: { name: string; description?: string }) =>
    apiClient.put<Category>(CATEGORY_URL + id, token, data),
  updateSubcategory: (token: string, id: string, data: { name: string; description?: string }) =>
    apiClient.put<Subcategory>(SUBCATEGORY_URL + id, token, data),
  deleteCategory: (token: string, id: string) => apiClient.delete<Category>(CATEGORY_URL + id, token),
  deleteSubcategory: (token: string, id: string) =>
    apiClient.delete<Subcategory>(SUBCATEGORY_URL + id, token),
};
