// ============================================================================
// API CLIENT - Modular Endpoints
// ============================================================================

import { apiClient } from "@/lib/api-client";
import type {
  Barcode,
  Category,
  Client,
  ClientCreateParams,
  ClientFilters,
  ClientUpdateParams,
  Credit,
  CreditCreateParams,
  Invoice,
  InvoiceCreateParams,
  InvoiceFilters,
  InvoiceUpdateParams,
  OrganisationCore,
  OrganisationMember,
  Payment,
  PaymentFilters,
  PaymentMethod,
  Product,
  ProductCreateParams,
  ProductFilters,
  ProductUpdateParams,
  Refund,
  Role,
  Subcategory,
} from "types";
import { buildQueryParams, cleanPayload } from "utils";
import {
  BUSINESS_URL,
  CANCEL_INVOICE_URL,
  CATEGORY_URL,
  CLIENT_URL,
  CREDIT_INVOICE_URL,
  CUSTOMERS_URL,
  DELETE_INVOICE_URL,
  EDIT_MEMBERS_URL,
  INVENTORY_CO_URL,
  INVENTORY_URL,
  INVOICE_ARCHIVES_URL,
  INVOICE_URL,
  LIST_BUSINESS_URL,
  LIST_MEMBERS_URL,
  MEMBERS_URL,
  PAYMENTS_URL,
  PRODUCTS_URL,
  SCAN_BARCODE_URL,
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

  updateMember: (
    token: string,
    id: string,
    memberId: string,
    data: {
      is_active?: boolean;
      role?: Role;
    },
  ) =>
    apiClient.post<OrganisationMember>(
      BUSINESS_URL + id + MEMBERS_URL + memberId + EDIT_MEMBERS_URL,
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

  // Sales & invoices
  // TODO:  Product Search

  getInvoices: (token: string, id: string) =>
    apiClient.get<Invoice[]>(INVOICE_URL + "?business_id=" + id, token),

  getFilteredInvoices: (
    token: string,
    id: string,
    filters?: InvoiceFilters,
  ) => {
    const query = buildQueryParams({ business_id: id, ...filters });
    return apiClient.get<Invoice[]>(`${INVOICE_URL}${query}`, token);
  },

  getArchivedInvoices: (token: string, id: string) =>
    apiClient.get<Invoice[]>(
      INVOICE_ARCHIVES_URL + "?business_id=" + id,
      token,
    ),

  getFilteredArchivedInvoices: (
    token: string,
    id: string,
    filters?: InvoiceFilters,
  ) => {
    const query = buildQueryParams({ business_id: id, ...filters });
    return apiClient.get<Invoice[]>(`${INVOICE_ARCHIVES_URL}${query}`, token);
  },

  getSingleInvoice: (token: string, id: string) =>
    apiClient.get<Invoice>(INVOICE_URL + id, token),

  getPayments: (token: string, id: string) =>
    apiClient.get<Payment[]>(PAYMENTS_URL + "?business_id=" + id, token),

  getFilteredPayments: (
    token: string,
    id: string,
    filters?: PaymentFilters,
  ) => {
    const query = buildQueryParams({ business_id: id, ...filters });
    return apiClient.get<Payment[]>(`${PAYMENTS_URL}${query}`, token);
  },

  getInvoicePayments: (token: string, id: string) =>
    apiClient.get<Payment[]>(INVOICE_URL + id + "/payments/", token),

  generateReceipt: (
    token: string,
    id: string,
    format: "inline" | "attachment",
  ) =>
    apiClient.get<any>(
      INVOICE_URL + id + "/receipt/" + "?output_format=" + format,
      token,
      { blob: true },
    ),

  createInvoice: (token: string, data: InvoiceCreateParams) =>
    apiClient.post<Invoice>(INVOICE_URL, token, cleanPayload(data)),

  creditInvoice: (
    token: string,
    id: string,
    data: { amount: number; payment_method: PaymentMethod },
  ) =>
    apiClient.post<Invoice>(
      INVOICE_URL + id + CREDIT_INVOICE_URL,
      token,
      cleanPayload(data),
    ),

  scanBarcode: (token: string, id: string, barcode: string) =>
    apiClient.post<Barcode>(
      SCAN_BARCODE_URL,
      token,
      cleanPayload({ business_id: id, barcode }),
    ),

  processRefund: (
    token: string,
    id: string,
    data: { amount: number; reason: string; restore_stock: boolean },
  ) => apiClient.post<undefined>(INVOICE_URL + id + "/refunds/", token, data),

  updateInvoice: (
    token: string,
    id: string,
    data: Partial<InvoiceUpdateParams>,
  ) => {
    return apiClient.put<Invoice>(INVOICE_URL + id, token, cleanPayload(data));
  },

  cancelInvoice: (token: string, id: string) =>
    apiClient.delete<Invoice>(INVOICE_URL + id + CANCEL_INVOICE_URL, token),

  archiveInvoice: (token: string, id: string) =>
    apiClient.delete<Invoice>(INVOICE_URL + id, token),

  deleteInvoice: (token: string, id: string) =>
    apiClient.delete<Invoice>(INVOICE_URL + id + DELETE_INVOICE_URL, token),

  // Customers
  getClients: (token: string, id: string) =>
    apiClient.get<Client[]>(CLIENT_URL + "?business_id=" + id, token),

  getFilteredClients: (token: string, id: string, filters?: ClientFilters) => {
    const query = buildQueryParams({ business_id: id, ...filters });
    return apiClient.get<Client[]>(`${CLIENT_URL}${query}`, token);
  },

  getSingleClient: (token: string, id: string) =>
    apiClient.get<Client>(CLIENT_URL + id, token),

  getCreditPayments: (token: string, id: string) =>
    apiClient.get<Payment[]>("/customers/credit/" + id + "/payments/", token),

  createClient: (token: string, data: ClientCreateParams) =>
    apiClient.post<Client>(CLIENT_URL, token, cleanPayload(data)),

  creditClient: (token: string, id: string, data: CreditCreateParams) =>
    apiClient.post<Credit>(
      CLIENT_URL + id + "credit",
      token,
      cleanPayload(data),
    ),

  payCredit: (
    token: string,
    id: string,
    data: {
      amount: number;
      payment_method: PaymentMethod;
      notes?: string;
      payment_date?: string;
    },
  ) => apiClient.post<Payment[]>("/customers/credit/" + id + "/pay/", token),

  updateClient: (token: string, id: string, data: ClientUpdateParams) =>
    apiClient.put<Client>(CLIENT_URL + id, token, cleanPayload(data)),

  removeClient: (token: string, id: string) =>
    apiClient.delete<undefined>(CLIENT_URL + id, token),

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

  invoices: (id: string) =>
    [...organisationKeys.detail(id), "invoices"] as const,
  invoice: (id: string) => ["invoice", id] as const,
  invoiceList: (id: string, filters?: InvoiceFilters) =>
    [...organisationKeys.detail(id), "invoices", { filters }] as const,

  payments: (id: string) =>
    [...organisationKeys.detail(id), "payments"] as const,
  payment: (id: string) => ["payments", id] as const,
  paymentList: (id: string, filters?: PaymentFilters & { invoice?: string }) =>
    [...organisationKeys.detail(id), "payments", { filters }] as const,

  receipt: (id: string) => ["receipt", id] as const,

  scanned: (id: string, code: string) =>
    [...organisationKeys.detail(id), code, "barcode"] as const,
  print: (id: string) => ["invoice", "print", id] as const,

  client: (id: string) => ["clients", id] as const,
  clientList: (id: string, filters?: PaymentFilters) =>
    [...organisationKeys.detail(id), "clients", { filters }] as const,

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
