// auth-error-messages.ts

import type { ServerErrorCode } from "@/lib/auth-error-codes";

export const SERVER_ERROR_MESSAGES: Record<ServerErrorCode, string> = {
  // General
  UNKNOWN: "Oops! Something went wrong. Please try again later.",
  NETWORK_ERROR:
    "We couldn’t reach the server. Please check your connection and try again.",
  TIMEOUT: "This request took too long. Please try again.",
  VALIDATION_ERROR: "",
  RATE_LIMIT_EXCEEDED: "",
  GOOGLE_OAUTH_EXCHANGE_FAILED: "",

  // Signup
  EMAIL_REQUIRED: "Please enter your email address.",
  EMAIL_INVALID: "Please enter a valid email address.",
  EMAIL_EXISTS:
    "An account with this email already exists. Try signing in instead.",
  PASSWORD_REQUIRED: "Please create a password.",
  PASSWORD_TOO_SHORT: "Your password must be at least 8 characters long.",
  PASSWORD_TOO_WEAK: "Please choose a stronger password.",
  PASSWORD_MISMATCH: "The passwords don’t match. Please check and try again.",

  // Sign in
  INVALID_CREDENTIALS: "The email or password you entered is incorrect.",
  ACCOUNT_NOT_FOUND: "We couldn’t find an account with that email.",
  ACCOUNT_DISABLED:
    "This account has been temporarily disabled. Please contact support.",

  // OTP
  OTP_REQUIRED: "Please enter the 6-digit code.",
  OTP_NOT_FOUND: "That code isn’t correct. Please try again.",
  OTP_EXPIRED: "This code has expired. Please request a new one.",
  OTP_ATTEMPTS_EXCEEDED:
    "Too many incorrect attempts. Please request a new code.",

  // Resend
  OTP_COOLDOWN_ACTIVE: "You can request a new code in a few minutes.",
  OTP_RESEND_LIMIT: "You’ve requested too many codes. Please try again later.",

  // Sign out
  NOT_AUTHENTICATED:
    "No session has been found. You need to be signed in to continue.",

  // Session
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  UNAUTHORIZED: "You need to sign in to continue.",
  PRODUCT_NOT_FOUND:
    "We couldn't find any product matching this barcode. Verify and try again",
};

// auth-error.ts
export interface ServerError {
  code: ServerErrorCode;
  message?: string; // optional override from backend
}

export const getServerErrorMessage = (code: string): string => {
  return Object.prototype.hasOwnProperty.call(SERVER_ERROR_MESSAGES, code)
    ? SERVER_ERROR_MESSAGES[code as ServerErrorCode]
    : SERVER_ERROR_MESSAGES.UNKNOWN;
};
