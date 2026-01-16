// AUTH ENDPOINTS
const BASE_URL = "https://maahbusiness.trustconsulting.tech/api/v1";
export const SIGNUP_URL = `${BASE_URL}/auth/signup/`;
export const VERIFY_OTP_URL = `${BASE_URL}/auth/verify-otp/`;
export const RESEND_OTP_URL = `${BASE_URL}/auth/request-otp/`;
export const REFRESH_TOKEN_URL = `${process.env.VITE_API_ENDPOINT}/auth/refresh_token/`;
export const GOOGLE_AUTH_URL = `${BASE_URL}/auth/google/auth-url/`;
export const SIGNIN_URL = `${BASE_URL}/auth/login/`;
export const SIGNOUT_URL = `${BASE_URL}/auth/logout/`;
export const FORGOT_PASSWORD_URL = `${BASE_URL}/auth/forgot-password/`;
export const RESET_PASSWORD_URL = `${BASE_URL}/auth/reset-password/`;

// BUSINESS ENDPOINTS
/**IMPORTANT: USE THIS WITH GET REQUESTS */
export const LIST_BUSINESS_URL = `${BASE_URL}/businesses/`;
export const CREATE_BUSINESS_URL = `${BASE_URL}/businesses/`;
