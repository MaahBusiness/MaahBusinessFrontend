import { apiClient } from "@/lib/api-client";
import { FINANCE_URL } from "utils/endpoints";

export type ExpenseCreateParams = {
  business_id: string;
  expense_type: string;
  amount: number;
  reason: string;
  reason_details: string;
  payee_name: string;
  payee_type: string;
  payment_method: string;
  payment_reference?: string;
  justification_metadata?: Record<string, unknown>;
};

export const financeApi = {
  listExpenses: (token: string, businessId: string) =>
    apiClient.get(`${FINANCE_URL}?business_id=${businessId}`, token),
  createExpense: (token: string, payload: ExpenseCreateParams) =>
    apiClient.post(FINANCE_URL, token, payload),
};
