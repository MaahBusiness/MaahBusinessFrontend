import {
  EXPENSE_PAYEE_TYPES,
  EXPENSE_PAYMENT_METHODS,
  EXPENSE_TYPES,
  type ExpensePayeeType,
  type ExpensePaymentMethod,
  type ExpenseType,
} from "@/lib/finance-types";

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  REPLENISHMENT: "Replenishment",
  MISCELLANEOUS: "Miscellaneous",
  ELECTRICITY: "Electricity",
  WATER: "Water",
  SALARY: "Salary",
  EXTRA: "Extra",
  MAINTENANCE: "Maintenance",
  TAX: "Tax",
  RENT: "Rent",
  MARKETING: "Marketing",
  INSURANCE: "Insurance",
  TRANSPORT: "Transport",
  UTILITIES: "Utilities",
  OFFICE_SUPPLIES: "Office supplies",
  PROFESSIONAL_SERVICES: "Professional services",
};

export const PAYMENT_METHOD_LABELS: Record<ExpensePaymentMethod, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile money",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CHECK: "Check",
  OTHER: "Other",
};

export const PAYEE_TYPE_LABELS: Record<ExpensePayeeType, string> = {
  EMPLOYEE: "Employee",
  SUPPLIER: "Supplier",
  SERVICE_PROVIDER: "Service provider",
  GOVERNMENT: "Government",
  LANDLORD: "Landlord",
  OTHER: "Other",
};

export const expenseTypes = EXPENSE_TYPES.map((value) => ({
  value,
  label: EXPENSE_TYPE_LABELS[value],
}));

export const paymentMethods = EXPENSE_PAYMENT_METHODS.map((value) => ({
  value,
  label: PAYMENT_METHOD_LABELS[value],
}));

export const payeeTypes = EXPENSE_PAYEE_TYPES.map((value) => ({
  value,
  label: PAYEE_TYPE_LABELS[value],
}));

export const approvalFilters = [
  { value: "true", label: "Approved" },
  { value: "false", label: "Pending" },
];

export const visibles = [
  { value: "reason", label: "Reason" },
  { value: "expense_type", label: "Type" },
  { value: "amount", label: "Amount" },
  { value: "payee_name", label: "Payee" },
  { value: "payment_method", label: "Payment" },
  { value: "is_approved", label: "Status" },
  { value: "created_at", label: "Date" },
];
