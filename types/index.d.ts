// OTHERS
/** For server responses */
export interface ServerActionState {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export type Role =
  | "owner"
  | "cashier"
  | "stock_keeper"
  | "delivery"
  | "customer"
  | "wholesaler"
  | "partner"
  | "manager";

export type Customer = "regular" | "wholesaler";
export type PaymentMethod =
  | "cash"
  | "card"
  | "mobile_money"
  | "stripe"
  | "paypal"
  | "credit";

export type InvoiceStatus = "paid" | "partial" | "refunded" | "cancelled";

export interface User extends UserSnapshot {
  is_active: boolean;
  email_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  phone_number?: string;
  last_login: string;
  address?: string;
  avatar_url?: string;
}

interface UserSnapshot {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

interface ExtendedUser {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
  business?: BusinessSnapshot;
}

/** User object in context of `OrganisationMember` */
interface OrganisationMemberUser extends UserSnapshot {
  phone_number?: string;
  avatar_url?: string;
  is_active: boolean;
}

/** Response data object for creating or retreiving business members (array) */
interface OrganisationMember {
  id: string;
  role: Role;
  is_active: boolean;
  joined_at: string;
  left_at?: string;
  created_at: string;
  updated_at: string;
  user?: OrganisationMemberUser;
}

/**
 * Core business data \
 * The response data object for when a business is created or retreived (array)
 */
interface OrganisationCore extends BusinessSnapshot {
  owner_id: string;
  description?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  qr_code_url?: string;
  logo_url?: string;
  is_active: boolean;
  settings?: object;
  created_at: string;
  updated_at: string;
  member_count: number;
  members?: OrganisationMember[];
  user?: UserSnapshot;
  categories?: Category[];
}

interface Pagination {
  count: number;
  next?: number;
  previous?: number;
  current_page: number;
  total_pages: number;
  page_size: number;
}

interface BusinessSnapshot {
  id: string;
  name: string;
  unique_name: string;
}

export interface OrganisationCustomers {
  id: string;
  business_id?: string;
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  customer_type: string;
  loyalty_points: string;
  total_purchases: string;
  created_at: string;
  updated_at: string;
}

export interface CreditCreate {
  customer_id: string;
  invoice_id: string;
  amount: number;
  due_date: string;
  notes?: string;
}

interface Credit {
  id: string;
  business_id: string;
  customer_id: string;
  invoice_id: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  status: string;
  notes?: string;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  barcode?: string;
  barcode_image_url?: string;
  category_id: string;
  subcategory_id?: string;
  purchase_price: number;
  unit_price: number;
  current_price: number;
  image_url?: string;
  quantity: number;
  min_quantity: number;
  is_low_stock: boolean;
  expiry_date?: string;
  is_expired: boolean;
  on_promotion: boolean;
  promotion_start_date?: string;
  promotion_end_date?: string;
  promo_price?: number;
  created_at: string;
  updated_at: string;
}

interface ProductFilters {
  // business_id: string,
  category_id?: string;
  subcategory_id?: string;
  name?: keyof Product;
  low_stock_only?: boolean;
  expired_only?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  order_by?: keyof Product;
}

// Future: Other modules (fetched separately)
// export interface OrganisationInventory {
//   // Will be added later
// }

// export interface OrganisationSales {
//   // Will be added later
// }

// Combined organisation data (all modules)
export interface Organisation {
  core: OrganisationCore;
  members?: OrganisationMember[];
  customers?: OrganisationCustomers;
  inventory?: OrganisationInventory;
  sales?: OrganisationSales;
}

///////////////////////////////////////////////////////

export type SessionData = {
  accessToken: string;
  refreshToken: string;
  user?: User;
};

type BACKEND_ERROR_CODES =
  | "GOOGLE_OAUTH_EXCHANGE_FAILED"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "INVALID_CREDENTIALS";

export interface GenericResponse {
  auth_url?: string;
  expires_in_minutes?: number;
  email?: string;

  access_token?: string;
  refresh_token?: string;
}

export interface BackendResponse {
  success: boolean;
  message?: string;
  data?:
    | GenericResponse
    | User // Retreiving profile
    | ExtendedUser // Log in or sign in or user session
    | OrganisationCore // create business
    | OrganisationCore[] // retreive businesss
    | OrganisationMember; //add new member
  error?: {
    code?: BACKEND_ERROR_CODES;
    message?: string;
    details?: {
      email?: string;
      otp?: string;
      retry_after?: number;
      limit?: number;
      period_seconds?: number;
      non_field_errors?: string;
    };
  };
  status_code: number;
  pagination?: Pagination;
}

export interface OTPMeta {
  email: string;
  otpExpiresAt?: number;
  resendAvailableAt?: number;
}

export interface OTPSessionData {
  email: string;
  otpExpiresAt: number;
  resendAvailableAt?: number;
  resendCount: number;
  redirectTo?: string;
}

export interface SignUpActionType extends ServerActionState {
  step?: "EMAIL" | "OTP";
  otpSession?: OTPSessionData;
  googleAuthUrl?: string;
}

/**Config type for sidebar nav items */
export interface SideItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  collapsible?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface ProductCreateParams extends ProductUpdateParams {
  business_id: string;
  on_promotion?: boolean;
  promotion_start_date?: string;
  promotion_end_date?: string;
  promo_price?: number;
}

interface ProductUpdateParams {
  name: string;
  description?: string;
  barcode?: string;
  category_id: string;
  subcategory_id?: string;
  purchase_price: number;
  unit_price: number;
  quantity?: number;
  min_quantity?: number;
  expiry_date?: string;
}

export interface Invoice {
  id: string; //
  business_id: string;
  number: number; //

  cashier_id: string; //
  cashier_name?: string;

  status: InvoiceStatus; //
  total: number; //
  tax: number; //
  total_discount: number; //
  advance_paid: number; //
  remaining_amount: number; //
  payment_method: PaymentMethod;
  is_credit_settled: boolean;
  due_date?: string; //

  created_at: string; //
  updated_at: string; //

  customer_name?: string; //
  customer_id?: string;

  reason?: string; ///
  is_archived: boolean;
  lines: InvoiceLine[]; //
  refund_amount: number; //
}

export interface InvoiceCreateParams {
  business_id: string;
  customer_name?: string;
  customer_id?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_type?: "REGULAR" | "WHOLESALER";
  lines: InvoiceLineCreateParams[];
  tax?: number;
  advance_paid?: number;
  payment_method: PaymentMethod;
  is_credit: boolean; // If True, due_date and reason are required.
  due_date?: string;
  reason?: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
  created_at: string;
  product_name: string;
}

export interface InvoiceLineCreateParams {
  product_id: string;
  quantity: string;
  discount?: number;
}

export interface InvoiceFilters {
  // business_id: string, //this is passed as route params, so not here
  status?: InvoiceStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  page_size?: number;
  order_by?: keyof Invoice;
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

declare module "@tanstack/react-table" {
  export interface ColumnMeta<TData extends RowData, TValue> {
    hidden?: boolean;
    /**Use this for the default sort column. Used only once per table */
    sort?: boolean;
  }
}
