// AUTH ENDPOINTS
export const BASE_URL = "https://maahbusiness.trustconsulting.tech/api/v1";
export const SIGNUP_URL = `/auth/signup/`;
export const VERIFY_OTP_URL = `/auth/verify-otp/`;
export const RESEND_OTP_URL = `/auth/request-otp/`;
export const REFRESH_TOKEN_URL = `/auth/refresh-token/`;
export const GOOGLE_AUTH_URL = `/auth/google/auth-url/`;
export const SIGNIN_URL = `/auth/login/`;
export const SIGNOUT_URL = `/auth/logout/`;
export const FORGOT_PASSWORD_URL = `/auth/forgot-password/`;
export const RESET_PASSWORD_URL = `/auth/reset-password/`;

// BUSINESS ENDPOINTS
/**IMPORTANT: USE THIS WITH GET REQUESTS */
export const LIST_BUSINESS_URL = `/businesses/`;
export const CREATE_BUSINESS_URL = `/businesses/`;
export const BUSINESS_URL = `/businesses/`;
// import.meta.env.VITE_API_BASE_URL;
// MEMBERS
export const LIST_MEMBERS_URL = `/members/list/`;
export const MEMBERS_URL = `/members/`;
export const EDIT_MEMBERS_URL = `/edit-member-role/`;

export const CUSTOMERS_URL = "/customers/";
export const PRODUCTS_URL = "/products/";
export const INVENTORY_CO_URL = "/inventory";
export const INVENTORY_URL = "/inventory/";
export const CATEGORY_URL = "/categories/";
export const SUBCATEGORY_URL = "/subcategories/";
export const INVOICE_URL = "/sales/";
export const PAYMENTS_URL = "/sales/payments/history/";
export const INVOICE_ARCHIVES_URL = "/sales/archives/";
export const CREDIT_INVOICE_URL = "/apply-credit/";
export const CANCEL_INVOICE_URL = "/cancel/";
export const DELETE_INVOICE_URL = "/delete/";
export const SCAN_BARCODE_URL = "/sales/products/scan/";
export const CLIENT_URL = "/customers/";
