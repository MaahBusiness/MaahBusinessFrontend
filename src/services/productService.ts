import api, { createFormDataApi } from "./api";
import type { Product, ProductListItem, PaginatedResponse } from "../types";

export const productService = {
  async getProducts(): Promise<PaginatedResponse<ProductListItem>> {
    const response = await api.get<PaginatedResponse<ProductListItem>>("/product/products/");
    return response.data;
  },

  async getProductDetail(productId: string): Promise<Product> {
    const response = await api.get<Product>("/product/detail/", {
      params: { product_id: productId },
    });
    return response.data;
  },

  async createProduct(productData: FormData): Promise<Product> {
    const formDataApi = createFormDataApi();
    const response = await formDataApi.post<Product>("/product/create/", productData);
    return response.data;
  },

  async updateProduct(productData: FormData): Promise<Product> {
    const formDataApi = createFormDataApi();
    const response = await formDataApi.put<Product>("/product/update/", productData);
    return response.data;
  },

  async deleteProduct(productId: string): Promise<void> {
    await api.delete("/product/delete/", {
      params: { product_id: productId },
    });
  },

  async getProductsByExpiryDate(): Promise<{
    expired_products: Product[];
    near_expiry_products: Product[];
  }> {
    const response = await api.get("/product/expiry_date/");
    return response.data;
  },
};

export default productService;
