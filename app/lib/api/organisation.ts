// ============================================================================
// API CLIENT - Modular Endpoints
// ============================================================================

import { apiClient } from "@/lib/api-client";
import type {
  Category,
  OrganisationCore,
  OrganisationMember,
  Product,
  ProductCreateParams,
  ProductFilters,
  ProductUpdateParams,
  Role,
  Subcategory,
} from "types";
import { buildQueryParams } from "utils";
import {
  BUSINESS_URL,
  CATEGORY_URL,
  CUSTOMERS_URL,
  INVENTORY_CO_URL,
  INVENTORY_URL,
  LIST_BUSINESS_URL,
  LIST_MEMBERS_URL,
  MEMBERS_URL,
  PRODUCTS_URL,
  SUBCATEGORY_URL,
} from "utils/endpoints";

export const organisationsApi = {
  // Core data
  getAll: (token: string) =>
    apiClient.get<OrganisationCore[]>(BUSINESS_URL, token),

  getById: (token: string, id: string) =>
    apiClient.get<OrganisationCore>(BUSINESS_URL + id, token),

  create: (
    token: string,
    data: {
      name: string;
      email: string;
      description: string;
      address?: string;
      phone_number?: string;
      logo?: File | undefined;
      logo_url?: string;
    },
  ) => apiClient.post<OrganisationCore>(BUSINESS_URL, token, data),

  // TODO::This one
  update: (
    token: string,
    id: string,
    data: {
      name: string;
      email: string;
      description: string;
      address?: string;
      phone_number?: string;
      logo_url?: string;
    },
  ) => apiClient.put<OrganisationCore>(BUSINESS_URL + id, token, data),

  delete: (token: string, id: string) =>
    apiClient.delete<undefined>(BUSINESS_URL + id, token),

  // Members data
  getMembers: (token: string, id: string) =>
    apiClient.get<OrganisationMember[]>(
      BUSINESS_URL + id + LIST_MEMBERS_URL,
      token,
    ),

  // TODO::ENDPOINT NOT RESOLVED YET
  addMember: (
    token: string,
    id: string,
    data: { user_id: string; role: string },
  ) =>
    apiClient.post<OrganisationMember>(
      BUSINESS_URL + id + MEMBERS_URL,
      token,
      data,
    ),

  addMemberByEmail: (
    token: string,
    id: string,
    data: {
      name?: string;
      email: string;
      password?: string;
      role: Role;
    },
  ) =>
    apiClient.post<OrganisationMember>(
      BUSINESS_URL + id + MEMBERS_URL,
      token,
      data,
    ),

  removeMember: (token: string, id: string, memberId: string) =>
    apiClient.delete<undefined>(
      LIST_BUSINESS_URL + id + MEMBERS_URL + memberId,
      token,
    ),

  // Categories data
  addCategory: (
    token: string,
    id: string,
    data: { name: string; description?: string },
  ) =>
    apiClient.post<Category>(
      INVENTORY_CO_URL + BUSINESS_URL + id + CATEGORY_URL,
      token,
      data,
    ),

  addSubCategory: (
    token: string,
    id: string,
    data: { name: string; description?: string; category_id: string },
  ) =>
    apiClient.post<Subcategory>(
      INVENTORY_CO_URL + BUSINESS_URL + id + SUBCATEGORY_URL,
      token,
      data,
    ),

  updateCategory: (
    token: string,
    id: string,
    data: { name: string; description?: string },
  ) => apiClient.put<Category>(CATEGORY_URL + id, token, data),

  updateSubcategory: (
    token: string,
    id: string,
    data: { name: string; description?: string },
  ) => apiClient.put<Category>(SUBCATEGORY_URL + id, token, data),

  deleteCategory: (token: string, id: string) =>
    apiClient.delete<Category>(CATEGORY_URL + id, token),

  deleteSubcategory: (token: string, id: string) =>
    apiClient.delete<Category>(SUBCATEGORY_URL + id, token),

  // PRODUCTS
  getProducts: (token: string, id: string) =>
    apiClient.get<Product[]>(PRODUCTS_URL + "?business_id=" + id, token),

  getFilteredProducts: (
    token: string,
    id: string,
    filters?: ProductFilters,
  ) => {
    const query = buildQueryParams({ business_id: id, ...filters });
    return apiClient.get<Product[]>(`${PRODUCTS_URL}${query}`, token);
  },

  getProduct: (token: string, id: string) => {
    return apiClient.get<Product>(PRODUCTS_URL + id, token);
  },

  addProduct: (token: string, id: string, data: ProductCreateParams) => {
    return apiClient.post<Product>(
      PRODUCTS_URL + "?business_id=" + id,
      token,
      data,
    );
  },

  updateProduct: (
    token: string,
    id: string,
    data: Partial<ProductUpdateParams>,
  ) => {
    return apiClient.put<Product>(PRODUCTS_URL + id, token, data);
  },

  removeProduct: (token: string, id: string) => {
    return apiClient.delete<Product>(PRODUCTS_URL + id, token);
  },

  getCustomers: (token: string, id: string) =>
    apiClient.get<OrganisationMember[]>(
      CUSTOMERS_URL + "?business_id=" + id,
      token,
    ),

  // Future: Other modules
  // getCustomers: (token: string, id: string) => ...
  // getInventory: (token: string, id: string) => ...
  // getSales: (token: string, id: string) => ...
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
