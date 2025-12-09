import api from "./api";
import type { Invoice, InvoiceCreateData, PaginatedResponse } from "../types";

export const invoiceService = {
  async getInvoices(page = 1): Promise<PaginatedResponse<Invoice>> {
    const response = await api.get<PaginatedResponse<Invoice>>(`/invoice/invoices/?page=${page}`);
    return response.data;
  },

  async getInvoiceDetail(invoiceId: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoice/${invoiceId}/detail/`);
    return response.data;
  },

  async createInvoice(invoiceData: InvoiceCreateData): Promise<Invoice> {
    const response = await api.post<Invoice>("/invoice/create-invoice/", invoiceData);
    return response.data;
  },

  async payDebt(invoiceId: string, amount: number): Promise<Invoice> {
    const response = await api.post<Invoice>("/invoice/pay-debt/", {
      invoice_id: invoiceId,
      amount: amount.toString(),
    });
    return response.data;
  },

  async archiveInvoice(invoiceId: string): Promise<void> {
    await api.post("/archive/archive-invoice/", {
      invoice_id: invoiceId,
    });
  },

  async exportPdf(invoiceId: string): Promise<Blob> {
    const response = await api.get(`/invoice/export-pdf/?invoice_id=${invoiceId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Archive management
  async getArchivedInvoices(page = 1): Promise<PaginatedResponse<Invoice>> {
    const response = await api.get<PaginatedResponse<Invoice>>(`/archive/archived-invoices/?page=${page}`);
    return response.data;
  },

  async restoreInvoice(invoiceId: string): Promise<Invoice> {
    const response = await api.post<Invoice>("/archive/restore-invoice/", {
      invoice_id: invoiceId,
    });
    return response.data;
  },
};

export default invoiceService;
