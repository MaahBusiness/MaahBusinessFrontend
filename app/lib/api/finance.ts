import type {
  Expense,
  ExpenseAuditLog,
  ExpenseCreateParams,
  ExpenseFilters,
  ExpenseSummary,
  ExpenseUpdateParams,
} from "@/lib/finance-types";
import { apiClient } from "@/lib/api-client";
import { buildQueryParams } from "utils";
import { FINANCE_URL } from "utils/endpoints";

export const financeKeys = {
  all: ["finance"] as const,
  org: (orgId: string) => [...financeKeys.all, orgId] as const,
  list: (orgId: string, filters?: ExpenseFilters) =>
    [...financeKeys.org(orgId), "expenses", { filters }] as const,
  detail: (expenseId: string) =>
    [...financeKeys.all, "expense", expenseId] as const,
  summary: (orgId: string, filters?: { start_date?: string; end_date?: string }) =>
    [...financeKeys.org(orgId), "summary", { filters }] as const,
  history: (expenseId: string) =>
    [...financeKeys.all, "history", expenseId] as const,
};

function buildExpenseListQuery(businessId: string, filters?: ExpenseFilters) {
  return buildQueryParams({
    business_id: businessId,
    ...filters,
  });
}

export const financeApi = {
  listExpenses: (token: string, businessId: string, filters?: ExpenseFilters) =>
    apiClient.get<Expense[]>(
      `${FINANCE_URL}${buildExpenseListQuery(businessId, filters)}`,
      token,
    ),

  getExpense: (token: string, expenseId: string) =>
    apiClient.get<Expense>(`${FINANCE_URL}${expenseId}/`, token),

  createExpense: (token: string, payload: ExpenseCreateParams) =>
    apiClient.post<Expense>(FINANCE_URL, token, payload),

  updateExpense: (token: string, expenseId: string, payload: ExpenseUpdateParams) =>
    apiClient.put<Expense>(`${FINANCE_URL}${expenseId}/`, token, payload),

  deleteExpense: (token: string, expenseId: string) =>
    apiClient.delete(`${FINANCE_URL}${expenseId}/`, token),

  getSummary: (
    token: string,
    businessId: string,
    filters?: { start_date?: string; end_date?: string },
  ) =>
    apiClient.get<ExpenseSummary>(
      `${FINANCE_URL}summary/${buildQueryParams({ business_id: businessId, ...filters })}`,
      token,
    ),

  getHistory: (token: string, expenseId: string) =>
    apiClient.get<ExpenseAuditLog[]>(
      `${FINANCE_URL}${expenseId}/history/`,
      token,
    ),
};
