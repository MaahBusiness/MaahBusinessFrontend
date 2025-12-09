// User types
export interface User {
  id: string;
  username: string;
  email: string;
  phone_number?: string;
  role: UserRole;
  is_active: boolean;
}

export type UserRole = 'manager' | 'cashier' | 'stock_keeper' | 'wholesale_client' | 'sales_agent';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  phone_number?: string;
  password: string;
  confirm_password?: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthResponse {
  access?: string;
  token?: string;
  user?: User;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  unit_price: number;
  purchase_price?: number;
  image?: string;
  quantity: number;
  min_quantity: number;
  is_expired: boolean;
  expiry_date?: string;
  on_promotion: boolean;
  promotion_start_date?: string;
  promotion_end_date?: string;
  promo_price?: number;
  category_id?: string;
  subcategory_id?: string;
}

export interface ProductListItem {
  id: string;
  product: Product;
  category?: Category;
  subcategory?: Subcategory;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  category_id: string;
  created_at?: string;
  updated_at?: string;
}

// Invoice types
export interface InvoiceLine {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price?: number;
  price?: number;
  discount: number;
  is_promotion: boolean;
  line_total?: number;
}

export interface Invoice {
  id: string;
  number?: string;
  client_name: string;
  reason?: string;
  tax: number;
  status: InvoiceStatus;
  due_date?: string;
  advance_paid: number;
  total: number;
  remaining_amount?: number;
  refund_amount?: number;
  lines: InvoiceLine[];
  cashier_name?: string;
  created_at?: string;
  is_credit_settled?: boolean;
}

export type InvoiceStatus = 'COMPLETED' | 'CREDIT' | 'CANCELLED';

export interface InvoiceCreateData {
  client_name?: string;
  reason?: string;
  tax: string;
  status: InvoiceStatus;
  due_date?: string | null;
  advance_paid: string;
  lines: Array<{
    product_id: string;
    quantity: number;
    discount: string;
    is_promotion: boolean;
  }>;
}

// Dashboard types
export interface DashboardStats {
  revenue: {
    total: number;
    completed: number;
    credit: {
      total: number;
      advance_paid: number;
      to_collect: number;
      count: number;
    };
    advance_paid?: number;
    outstanding?: number;
    trend: TrendData;
  };
  profit: {
    total: number;
    completed: number;
    credit: number;
    trend: TrendData;
  };
  orders: {
    total: number;
    completed: number;
    credit: number;
    trend: TrendData;
  };
  averageOrderValue: {
    value: number;
    change: number;
    change_percent: number;
  };
}

export interface TrendData {
  status: 'up' | 'down';
  percentage: number;
  direction?: 'up' | 'down';
}

export interface InventoryData {
  stockStatus: Array<{ name: string; value: number; color: string }>;
  stockData: unknown[];
  alerts: {
    lowStock?: number;
    outOfStock?: number;
    overstocked?: number;
    total_products?: number;
    critical?: number;
  };
}

export interface ProductPerformance {
  top_products: Array<{ name: string; revenue: number; margin: number }>;
  top_categories: Array<{ name: string; revenue: number }>;
}

export interface SalesDataPoint {
  date: string;
  completed?: { revenue: number; profit: number };
  credit?: { revenue: number; profit: number };
}

export interface RecentSale {
  invoice_id?: string;
  customer: string;
  date: string;
  formatted_date?: string;
  items: number;
  total: number;
  margin: number;
}

// Notification types
export interface AppNotification {
  id: string;
  message: string;
  status: 'READ' | 'UNREAD';
  created_at?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

// Pagination types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
