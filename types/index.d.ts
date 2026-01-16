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
  | "partner";

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

interface BusinessMemberUser extends UserSnapshot {
  phone_number?: string;
  avatar_url?: string;
  is_active: boolean;
}

interface BusinessMember {
  id: string;
  role: Role;
  is_active: boolean;
  joined_at: string;
  left_at?: string;
  created_at: string;
  updated_at: string;
  user: BusinessMemberUser;
}

interface BusinessResponse extends BusinessSnapshot {
  owner_id: string;
  description?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  qr_code_url?: string;
  logo_url?: string;
  is_active: boolean;
  settings?: {};
  created_at: string;
  updated_at: string;
  member_count: number;
  members?: BusinessMember[];
  user?: UserSnapshot;
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
    | BusinessResponse // create business
    | BusinessResponse[] // retreive businesss
    | BusinessMember; //add new member
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
