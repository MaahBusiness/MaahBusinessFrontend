import type { Invoice } from "types";
import {
  CheckCircle,
  RotateCcw,
  Banknote,
  CreditCard,
  Smartphone,
  Globe,
  Wallet,
  FileClock,
  CircleOff,
  Timer,
} from "lucide-react";

export const mockInvoices: Invoice[] = [
  {
    id: "inv_001",
    business_id: "biz_001",
    number: 1001,

    cashier_id: "user_001",
    cashier_name: "Alice Johnson",

    status: "paid",
    total: 120,
    tax: 10,
    total_discount: 0,
    advance_paid: 120,
    remaining_amount: 0,
    payment_method: "cash",
    is_credit_settled: true,

    created_at: "2026-01-20T10:15:00Z",
    updated_at: "2026-01-20T10:15:00Z",

    customer_name: "John Doe",
    customer_id: "cust_001",

    is_archived: false,
    refund_amount: 0,

    lines: [
      {
        id: "line_001",
        invoice_id: "inv_001",
        product_id: "prod_001",
        product_name: "Rice Bag 25kg",
        quantity: 1,
        unit_price: 120,
        discount: 0,
        line_total: 120,
        created_at: "2026-01-20T10:15:00Z",
      },
    ],
  },

  {
    id: "inv_002",
    business_id: "biz_001",
    number: 1002,

    cashier_id: "user_002",
    cashier_name: "Mark Benson",

    status: "partial",
    total: 300,
    tax: 25,
    total_discount: 20,
    advance_paid: 100,
    remaining_amount: 200,
    payment_method: "credit",
    is_credit_settled: false,
    due_date: "2026-02-05",

    created_at: "2026-01-21T14:30:00Z",
    updated_at: "2026-01-21T14:30:00Z",

    customer_name: "Sarah Ltd",
    customer_id: "cust_002",

    is_archived: false,
    refund_amount: 0,

    lines: [
      {
        id: "line_002",
        invoice_id: "inv_002",
        product_id: "prod_002",
        product_name: "Cooking Oil 5L",
        quantity: 3,
        unit_price: 100,
        discount: 20,
        line_total: 280,
        created_at: "2026-01-21T14:30:00Z",
      },
    ],
  },

  {
    id: "inv_003",
    business_id: "biz_001",
    number: 1003,

    cashier_id: "user_001",
    cashier_name: "Alice Johnson",

    status: "cancelled",
    total: 80,
    tax: 5,
    total_discount: 0,
    advance_paid: 0,
    remaining_amount: 0,
    payment_method: "card",
    is_credit_settled: true,

    created_at: "2026-01-22T09:00:00Z",
    updated_at: "2026-01-22T09:05:00Z",

    reason: "Customer cancelled order",
    is_archived: false,
    refund_amount: 0,

    lines: [
      {
        id: "line_003",
        invoice_id: "inv_003",
        product_id: "prod_003",
        product_name: "Sugar 1kg",
        quantity: 4,
        unit_price: 20,
        discount: 0,
        line_total: 80,
        created_at: "2026-01-22T09:00:00Z",
      },
    ],
  },

  {
    id: "inv_004",
    business_id: "biz_001",
    number: 1004,

    cashier_id: "user_003",
    cashier_name: "David Kim",

    status: "refunded",
    total: 150,
    tax: 12,
    total_discount: 0,
    advance_paid: 150,
    remaining_amount: 0,
    payment_method: "stripe",
    is_credit_settled: true,

    created_at: "2026-01-23T16:45:00Z",
    updated_at: "2026-01-23T17:00:00Z",

    customer_name: "Emily Stone",
    customer_id: "cust_003",

    reason: "Defective product",
    is_archived: false,
    refund_amount: 150,

    lines: [
      {
        id: "line_004",
        invoice_id: "inv_004",
        product_id: "prod_004",
        product_name: "Electric Kettle",
        quantity: 1,
        unit_price: 150,
        discount: 0,
        line_total: 150,
        created_at: "2026-01-23T16:45:00Z",
      },
    ],
  },

  {
    id: "inv_005",
    business_id: "biz_001",
    number: 1005,

    cashier_id: "user_002",
    cashier_name: "Mark Benson",

    status: "paid",
    total: 60,
    tax: 4,
    total_discount: 5,
    advance_paid: 60,
    remaining_amount: 0,
    payment_method: "mobile_money",
    is_credit_settled: true,

    created_at: "2026-01-24T11:20:00Z",
    updated_at: "2026-01-24T11:20:00Z",

    customer_name: "Walk-in Customer",

    is_archived: false,
    refund_amount: 0,

    lines: [
      {
        id: "line_005",
        invoice_id: "inv_005",
        product_id: "prod_005",
        product_name: "Soft Drink Pack",
        quantity: 2,
        unit_price: 30,
        discount: 5,
        line_total: 55,
        created_at: "2026-01-24T11:20:00Z",
      },
    ],
  },

  // Edge Cases
  // 1️⃣ Zero totals (fully discounted / free invoice)
  {
    id: "inv_edge_001",
    business_id: "biz_001",
    number: 2001,

    cashier_id: "user_001",

    status: "paid",
    total: 0,
    tax: 0,
    total_discount: 100,
    advance_paid: 0,
    remaining_amount: 0,
    payment_method: "cash",
    is_credit_settled: true,

    created_at: "2026-01-25T08:00:00Z",
    updated_at: "2026-01-25T08:00:00Z",

    is_archived: false,
    refund_amount: 0,

    lines: [],
  },

  // 2️⃣ Overpaid invoice (advance > total)
  {
    id: "inv_edge_002",
    business_id: "biz_001",
    number: 2002,

    cashier_id: "user_002",

    status: "paid",
    total: 100,
    tax: 5,
    total_discount: 0,
    advance_paid: 150,
    remaining_amount: -50,
    payment_method: "card",
    is_credit_settled: true,

    created_at: "2026-01-25T09:30:00Z",
    updated_at: "2026-01-25T09:30:00Z",

    reason: "Customer overpaid",
    is_archived: false,
    refund_amount: 50,

    lines: [
      {
        id: "line_edge_002",
        invoice_id: "inv_edge_002",
        product_id: "prod_006",
        product_name: "USB Charger",
        quantity: 1,
        unit_price: 100,
        discount: 0,
        line_total: 100,
        created_at: "2026-01-25T09:30:00Z",
      },
    ],
  },

  // 3️⃣ Credit invoice overdue (partial + past due date)
  {
    id: "inv_edge_003",
    business_id: "biz_001",
    number: 2003,

    cashier_id: "user_003",

    status: "partial",
    total: 500,
    tax: 40,
    total_discount: 0,
    advance_paid: 100,
    remaining_amount: 400,
    payment_method: "credit",
    is_credit_settled: false,
    due_date: "2025-12-31",

    created_at: "2025-12-01T12:00:00Z",
    updated_at: "2025-12-01T12:00:00Z",

    customer_name: "Bulk Buyer Inc",
    customer_id: "cust_edge_001",

    is_archived: false,
    refund_amount: 0,

    lines: [
      {
        id: "line_edge_003",
        invoice_id: "inv_edge_003",
        product_id: "prod_007",
        product_name: "Cement Bag",
        quantity: 10,
        unit_price: 50,
        discount: 0,
        line_total: 500,
        created_at: "2025-12-01T12:00:00Z",
      },
    ],
  },

  // 4️⃣ Cancelled invoice with advance paid (should be refunded)
  {
    id: "inv_edge_004",
    business_id: "biz_001",
    number: 2004,

    cashier_id: "user_001",

    status: "cancelled",
    total: 200,
    tax: 15,
    total_discount: 0,
    advance_paid: 200,
    remaining_amount: 0,
    payment_method: "mobile_money",
    is_credit_settled: true,

    created_at: "2026-01-26T10:10:00Z",
    updated_at: "2026-01-26T10:20:00Z",

    reason: "Out of stock after payment",
    is_archived: false,
    refund_amount: 200,

    lines: [
      {
        id: "line_edge_004",
        invoice_id: "inv_edge_004",
        product_id: "prod_008",
        product_name: "Gas Cylinder",
        quantity: 1,
        unit_price: 200,
        discount: 0,
        line_total: 200,
        created_at: "2026-01-26T10:10:00Z",
      },
    ],
  },

  // 5️⃣ Archived invoice (should be hidden in most views)
  {
    id: "inv_edge_005",
    business_id: "biz_001",
    number: 2005,

    cashier_id: "user_004",

    status: "paid",
    total: 75,
    tax: 6,
    total_discount: 0,
    advance_paid: 75,
    remaining_amount: 0,
    payment_method: "paypal",
    is_credit_settled: true,

    created_at: "2025-11-15T18:00:00Z",
    updated_at: "2025-11-15T18:00:00Z",

    customer_name: "Test Customer",

    is_archived: true,
    refund_amount: 0,

    lines: [
      {
        id: "line_edge_005",
        invoice_id: "inv_edge_005",
        product_id: "prod_009",
        product_name: "Notebook",
        quantity: 3,
        unit_price: 25,
        discount: 0,
        line_total: 75,
        created_at: "2025-11-15T18:00:00Z",
      },
    ],
  },
];

export const STATUS_META = {
  paid: {
    icon: CheckCircle,
    className: "text-green-700 border-green-300",
  },
  partial: {
    icon: Timer,
    className: "text-yellow-700 border-yellow-300",
  },
  refunded: {
    icon: RotateCcw,
    className: "text-blue-700 border-blue-300",
  },
  cancelled: {
    icon: CircleOff,
    className: "text-red-700 border-red-300",
  },
} as const;

export const statuses = [
  {
    value: "paid",
    label: "Paid",
    icon: CheckCircle,
    // className: "text-green-700 border-green-300",
  },

  {
    value: "partial",
    label: "Partial",
    icon: Timer,
    // className: "text-yellow-700 border-yellow-300",
  },
  {
    value: "refunded",
    label: "Refunded",
    icon: RotateCcw,
    // className: "text-blue-700 border-blue-300",
  },

  {
    value: "cancelled",
    label: "Cancelled",
    icon: CheckCircle,
    className: "text-destructive border-red-300",
  },
];
export const methods = [
  {
    value: "cash",
    label: "Cash",
    icon: Banknote,
  },

  {
    value: "card",
    label: "Card",
    icon: CreditCard,
  },
  {
    value: "mobile_money",
    label: "Mobile Money",
    icon: Smartphone,
  },
  {
    value: "stripe",
    label: "Stripe",
    icon: Globe,
  },
  {
    value: "paypal",
    label: "PayPal",
    icon: Wallet,
  },
  {
    value: "credit",
    label: "Credit",
    icon: FileClock,
  },
];
