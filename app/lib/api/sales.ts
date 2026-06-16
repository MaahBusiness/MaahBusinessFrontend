import { apiClient } from "@/lib/api-client";
import type { Invoice, InvoiceCreateParams, InvoiceFilters } from "types";
import { buildQueryParams } from "utils";
import { INVOICE_URL } from "utils/endpoints";

export const salesApi = {
  list: (token: string, businessId: string, filters?: InvoiceFilters) => {
    const query = buildQueryParams({ business_id: businessId, ...filters });
    return apiClient.get<Invoice[]>(`${INVOICE_URL}${query}`, token);
  },
  getById: (token: string, id: string) => apiClient.get<Invoice>(INVOICE_URL + id + "/", token),
  create: (token: string, data: InvoiceCreateParams) =>
    apiClient.post<Invoice>(INVOICE_URL, token, data),
};
