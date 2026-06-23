import { apiClient } from "@/lib/api-client";
import type {
  Barcode,
  Invoice,
  InvoiceCreateParams,
  InvoiceFilters,
  InvoiceUpdateParams,
  Payment,
  PaymentFilters,
  PaymentMethod,
} from "types";
import { buildQueryParams, cleanPayload } from "utils";
import {
  CANCEL_INVOICE_URL,
  CREDIT_INVOICE_URL,
  DELETE_INVOICE_URL,
  INVOICE_ARCHIVES_URL,
  INVOICE_URL,
  PAYMENTS_URL,
  SCAN_BARCODE_URL,
} from "utils/endpoints";

export const salesApi = {
  list: (token: string, businessId: string, filters?: InvoiceFilters) => {
    const query = buildQueryParams({ business_id: businessId, ...filters });
    return apiClient.get<Invoice[]>(`${INVOICE_URL}${query}`, token);
  },
  getArchived: (token: string, businessId: string, filters?: InvoiceFilters) => {
    const query = buildQueryParams({ business_id: businessId, ...filters });
    return apiClient.get<Invoice[]>(`${INVOICE_ARCHIVES_URL}${query}`, token);
  },
  getById: (token: string, id: string) =>
    apiClient.get<Invoice>(`${INVOICE_URL}${id}/`, token),
  create: (token: string, data: InvoiceCreateParams) =>
    apiClient.post<Invoice>(INVOICE_URL, token, cleanPayload(data)),
  update: (token: string, id: string, data: Partial<InvoiceUpdateParams>) =>
    apiClient.put<Invoice>(INVOICE_URL + id, token, cleanPayload(data)),
  cancel: (token: string, id: string) =>
    apiClient.delete<Invoice>(INVOICE_URL + id + CANCEL_INVOICE_URL, token),
  archive: (token: string, id: string) =>
    apiClient.delete<Invoice>(INVOICE_URL + id, token),
  delete: (token: string, id: string) =>
    apiClient.delete<Invoice>(INVOICE_URL + id + DELETE_INVOICE_URL, token),
  credit: (
    token: string,
    id: string,
    data: { amount: number; payment_method: PaymentMethod },
  ) =>
    apiClient.post<Invoice>(
      INVOICE_URL + id + CREDIT_INVOICE_URL,
      token,
      cleanPayload(data),
    ),
  scanBarcode: (token: string, businessId: string, barcode: string) =>
    apiClient.post<Barcode>(
      SCAN_BARCODE_URL,
      token,
      cleanPayload({ business_id: businessId, barcode }),
    ),
  processRefund: (
    token: string,
    id: string,
    data: { amount: number; reason: string; restore_stock: boolean },
  ) => apiClient.post<undefined>(INVOICE_URL + id + "/refunds/", token, data),
  getPayments: (token: string, businessId: string, filters?: PaymentFilters) => {
    const query = buildQueryParams({ business_id: businessId, ...filters });
    return apiClient.get<Payment[]>(`${PAYMENTS_URL}${query}`, token);
  },
  getInvoicePayments: (token: string, id: string) =>
    apiClient.get<Payment[]>(INVOICE_URL + id + "/payments/", token),
  generateReceipt: (
    token: string,
    id: string,
    format: "inline" | "attachment",
  ) =>
    apiClient.get<Blob>(
      INVOICE_URL + id + "/receipt/?output_format=" + format,
      token,
      { blob: true },
    ),
};
