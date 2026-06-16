import { apiClient } from "@/lib/api-client";
import { businessesApi } from "@/lib/api/businesses";
import { customersApi } from "@/lib/api/customers";
import { productsApi } from "@/lib/api/products";
import { salesApi } from "@/lib/api/sales";
import type { InvoiceFilters, ProductFilters, ProductUpdateParams } from "types";
import { BUSINESS_URL, MEMBERS_URL } from "utils/endpoints";

export const organisationsApi = {
  getAll: businessesApi.getAll,
  getById: businessesApi.getById,
  create: businessesApi.create,
  update: businessesApi.update,
  delete: businessesApi.delete,
  getMembers: businessesApi.getMembers,
  addMemberByEmail: businessesApi.addMember,
  addMember: (
    token: string,
    id: string,
    data: { user_id: string; role: string },
  ) =>
    apiClient.post(BUSINESS_URL + id + MEMBERS_URL, token, data),
  updateMember: businessesApi.updateMember,
  removeMember: businessesApi.removeMember,
  addCategory: productsApi.addCategory,
  addSubCategory: productsApi.addSubcategory,
  updateCategory: productsApi.updateCategory,
  updateSubcategory: productsApi.updateSubcategory,
  deleteCategory: productsApi.deleteCategory,
  deleteSubcategory: productsApi.deleteSubcategory,
  getProducts: (token: string, id: string) => productsApi.getFiltered(token, id),
  getFilteredProducts: (token: string, id: string, filters?: ProductFilters) =>
    productsApi.getFiltered(token, id, filters),
  getProduct: productsApi.getById,
  addProduct: productsApi.create,
  updateProduct: (token: string, id: string, data: Partial<ProductUpdateParams>) =>
    productsApi.update(token, id, data),
  removeProduct: productsApi.remove,
  getInvoices: (token: string, id: string) => salesApi.list(token, id),
  getFilteredInvoices: (token: string, id: string, filters?: InvoiceFilters) =>
    salesApi.list(token, id, filters),
  getCustomers: customersApi.list,
};

export const organisationKeys = {
  // All organisations
  all: ["organisations"] as const,

  // Organisation lists
  lists: () => [...organisationKeys.all, "list"] as const,
  list: (filters?: string) =>
    [...organisationKeys.lists(), { filters }] as const,

  // Single organisation (all modules)
  details: () => [...organisationKeys.all, "detail"] as const,
  detail: (id: string) => [...organisationKeys.details(), id] as const,

  // Organisation modules (specific data)
  core: (id: string) => [...organisationKeys.detail(id), "core"] as const,
  members: (id: string) => [...organisationKeys.detail(id), "members"] as const,

  products: (id: string) =>
    [...organisationKeys.detail(id), "products"] as const,
  product: (id: string) => ["product", id] as const,
  prodlist: (id: string, filters?: ProductFilters) =>
    [...organisationKeys.detail(id), "products", { filters }] as const,

  invoices: (id: string) =>
    [...organisationKeys.detail(id), "invoices"] as const,
  invoice: (id: string) => ["invoice", id] as const,
  invoiceList: (id: string, filters?: InvoiceFilters) =>
    [...organisationKeys.detail(id), "invoices", { filters }] as const,

  customers: (id: string) =>
    [...organisationKeys.detail(id), "customers"] as const,
  inventory: (id: string) =>
    [...organisationKeys.detail(id), "inventory"] as const,
  sales: (id: string) => [...organisationKeys.detail(id), "sales"] as const,
};

/*
CACHE STRUCTURE:
["organisations"]                              // All org data
  ["organisations", "list"]                    // List of orgs
  ["organisations", "detail", "org_123"]       // Org org_123 (all modules)
    ["organisations", "detail", "org_123", "core"]      // Core data
    ["organisations", "detail", "org_123", "meta"]      // Meta data
    ["organisations", "detail", "org_123", "members"]   // Members
    ["organisations", "detail", "org_123", "customers"] // Customers
*/
