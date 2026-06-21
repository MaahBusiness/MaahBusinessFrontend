export const EXPENSE_TYPES = [
  "REPLENISHMENT",
  "MISCELLANEOUS",
  "ELECTRICITY",
  "WATER",
  "SALARY",
  "EXTRA",
  "MAINTENANCE",
  "TAX",
  "RENT",
  "MARKETING",
  "INSURANCE",
  "TRANSPORT",
  "UTILITIES",
  "OFFICE_SUPPLIES",
  "PROFESSIONAL_SERVICES",
] as const;

export const EXPENSE_PAYMENT_METHODS = [
  "CASH",
  "MOBILE_MONEY",
  "BANK_TRANSFER",
  "CARD",
  "CHECK",
  "OTHER",
] as const;

export const EXPENSE_PAYEE_TYPES = [
  "EMPLOYEE",
  "SUPPLIER",
  "SERVICE_PROVIDER",
  "GOVERNMENT",
  "LANDLORD",
  "OTHER",
] as const;

export type ExpenseType = (typeof EXPENSE_TYPES)[number];
export type ExpensePaymentMethod = (typeof EXPENSE_PAYMENT_METHODS)[number];
export type ExpensePayeeType = (typeof EXPENSE_PAYEE_TYPES)[number];

export type Expense = {
  id: string;
  business_id: string;
  expense_type: ExpenseType;
  amount: string;
  reason: string;
  reason_details: string;
  user_id: string;
  user_name?: string;
  approved_by: string | null;
  is_approved: boolean;
  payment_method: ExpensePaymentMethod;
  payment_reference: string;
  payee_type: ExpensePayeeType;
  payee_name: string;
  justification_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ExpenseFilters = {
  search?: string;
  expense_type?: ExpenseType;
  start_date?: string;
  end_date?: string;
  payment_method?: ExpensePaymentMethod;
  payee_type?: ExpensePayeeType;
  min_amount?: number;
  max_amount?: number;
  is_approved?: boolean;
  order_by?: string;
  page?: number;
  page_size?: number;
};

export type ExpenseCreateParams = {
  business_id: string;
  expense_type: ExpenseType;
  amount: number;
  reason: string;
  reason_details: string;
  payee_name: string;
  payee_type: ExpensePayeeType;
  payment_method: ExpensePaymentMethod;
  payment_reference?: string;
  justification_metadata?: Record<string, unknown>;
};

export type ExpenseUpdateParams = Partial<
  Omit<ExpenseCreateParams, "business_id">
> & {
  is_approved?: boolean;
};

export type ExpenseSummary = {
  business_id: string;
  total_amount: string;
  total_count: number;
  by_type: Array<{
    expense_type: ExpenseType;
    total_amount: string;
    count: number;
    average_amount: string;
    percentage_of_total: string;
  }>;
  by_payment_method: Record<string, string>;
  monthly_stats: Array<{
    month: string;
    total_amount: string;
    count: number;
  }>;
};

export type ExpenseAuditLog = {
  id: string;
  expense_id: string;
  action: string;
  performed_by: string | null;
  amount_before: string | null;
  amount_after: string | null;
  reason_before: string | null;
  reason_after: string | null;
  reason_details_before: string | null;
  reason_details_after: string | null;
  payment_method_before: string | null;
  payment_method_after: string | null;
  payee_type_before: string | null;
  payee_type_after: string | null;
  payee_name_before: string | null;
  payee_name_after: string | null;
  justification_snapshot: Record<string, unknown>;
  created_at: string;
};
