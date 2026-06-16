/**
 * FOR AUTH server actions
 */

import { SERVER_ERROR_MESSAGES } from "@/lib/auth-error-state";
import { destroySession, sessionCookie } from "@/lib/session.server";
import { minutesToSeconds } from "date-fns";
import { data, redirect } from "react-router";
import type {
  BackendResponse,
  OTPSessionData,
  ServerActionState,
  SignUpActionType,
  GenericResponse,
  ExtendedUser,
} from "types";
import {
  genericErrorState,
  expiryFromNowSeconds,
  genericNetworkError,
  getRateLimitMessage,
  handleRateLimitError,
  passwordRules,
} from "utils";
import {
  BASE_URL,
  FORGOT_PASSWORD_URL,
  GOOGLE_AUTH_URL,
  GOOGLE_CALLBACK_URL,
  RESEND_OTP_URL,
  RESET_PASSWORD_URL,
  SIGNIN_URL,
  SIGNOUT_URL,
  SIGNUP_URL,
  VERIFY_OTP_URL,
} from "utils/endpoints";

const MAX_RESEND_ATTEMPTS = 3;
const SOFT_COOLDOWN_MINUTES = 5;

// -------------------------------------
// EMAIL SIGNUP
// -------------------------------------
export async function signUpWithEmail(formData: FormData) {
  const name = formData.get("name") as string | undefined;
  const email = formData.get("email") as string | undefined;
  const password = formData.get("password") as string | undefined;
  const redirectTo = formData.get("redirectTo") as string | undefined;

  const errors: Record<string, string> = {};

  if (!name) errors.name = "Please enter your name.";
  if (!email) errors.email = "Please enter your email address.";

  if (!password) {
    errors.password = "Please enter your password.";
  } else {
    const failedRule = passwordRules.find((rule) => !rule.test(password));
    if (failedRule) errors.password = failedRule.message;
  }

  if (Object.keys(errors).length > 0) {
    return data<SignUpActionType>(
      { success: false, errors, step: "EMAIL" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(BASE_URL + SIGNUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        confirm_password: password,
      }),
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<SignUpActionType>(
          handleRateLimitError("EMAIL", error.details?.retry_after),
          {
            status: res.status,
          },
        );
      }

      if (error?.code === "VALIDATION_ERROR") {
        return data<SignUpActionType>(
          { success: false, message: error.message, step: "EMAIL" },
          { status: res.status },
        );
      }

      return data<SignUpActionType>(
        { ...genericErrorState(), step: "EMAIL" },
        { status: res.status },
      );
    }

    const otpExpiresAt = expiryFromNowSeconds(
      minutesToSeconds(
        (result.data as GenericResponse)?.expires_in_minutes || 5,
      ),
    );

    return data<SignUpActionType>(
      {
        success: true,
        step: "OTP",
        otpSession: {
          email: email!,
          otpExpiresAt,
          resendCount: 0,
          redirectTo,
        },
      },
      { status: res.status },
    );
  } catch (err) {
    return data<SignUpActionType>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
        step: "EMAIL",
      },
      { status: 500 },
    );
  }
}

// -------------------------------------
// OTP VERIFICATION
// -------------------------------------
export async function verifyOTP(
  formData: FormData,
  otpSession: OTPSessionData,
) {
  const otp = formData.get("otp") as string | undefined;

  if (!otp) {
    return data<SignUpActionType>(
      {
        success: false,
        errors: { otp: "Please enter the 6-digit code." },
        step: "OTP",
        otpSession,
      },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(BASE_URL + VERIFY_OTP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<SignUpActionType>(
          handleRateLimitError("OTP", error.details?.retry_after, otpSession),
          { status: res.status },
        );
      }

      if (error?.code === "VALIDATION_ERROR") {
        return data<SignUpActionType>(
          {
            success: false,
            message: error.message,
            step: "OTP",
            otpSession,
          },
          { status: res.status },
        );
      }

      return data<SignUpActionType>(
        {
          success: false,
          message: SERVER_ERROR_MESSAGES[error?.code || "UNKNOWN"],
          step: "OTP",
          otpSession,
        },
        { status: res.status },
      );
    }
    const resData = result.data as ExtendedUser;
    const accessToken = resData.access_token;
    const refreshToken = resData.refresh_token;
    const user = resData.user;

    if (!accessToken || !refreshToken || !user) {
      return data<SignUpActionType>(
        {
          success: false,
          message: SERVER_ERROR_MESSAGES["UNKNOWN"],
          step: "OTP",
          otpSession,
        },
        { status: 500 },
      );
    }

    return redirect(otpSession.redirectTo || "/dashboard", {
      headers: {
        "Set-Cookie": await sessionCookie.serialize({
          accessToken,
          refreshToken,
          user,
        }),
      },
    });
  } catch (err) {
    return data<SignUpActionType>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
        step: "OTP",
        otpSession,
      },
      { status: 500 },
    );
  }
}

// -------------------------------------
// Resend OTP
// -------------------------------------
export async function resendOTP(otpSession: OTPSessionData) {
  const { email, resendCount, resendAvailableAt } = otpSession;

  // Check if still in cooldown period
  if (resendAvailableAt && Date.now() < resendAvailableAt) {
    const secondsLeft = Math.ceil((resendAvailableAt - Date.now()) / 1000);
    return data<SignUpActionType>(
      {
        success: false,
        message: getRateLimitMessage(secondsLeft),
        step: "OTP",
        otpSession,
      },
      { status: 429 },
    );
  }

  // Soft limit: 3 attempts before triggering soft cooldown
  if (resendCount >= MAX_RESEND_ATTEMPTS && !resendAvailableAt) {
    const softCooldownAt = expiryFromNowSeconds(
      minutesToSeconds(SOFT_COOLDOWN_MINUTES),
    );

    return data<SignUpActionType>(
      {
        success: false,
        message: getRateLimitMessage(minutesToSeconds(SOFT_COOLDOWN_MINUTES)),
        step: "OTP",
        otpSession: {
          ...otpSession,
          resendAvailableAt: softCooldownAt,
        },
      },
      { status: 429 },
    );
  }

  try {
    const res = await fetch(BASE_URL + RESEND_OTP_URL, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email }),
    });

    // const result = (await res.json()) as BackendResponse;

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;

      // Backend hard rate limit - enforce API cooldown
      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<SignUpActionType>(
          handleRateLimitError("OTP", error.details?.retry_after, {
            ...otpSession,
            resendCount: MAX_RESEND_ATTEMPTS, // Max out to prevent further attempts
          }),
          { status: res.status },
        );
      }

      if (error?.code === "VALIDATION_ERROR") {
        return data<SignUpActionType>(
          {
            success: false,
            message: error.message,
            step: "OTP",
            otpSession,
          },
          { status: res.status },
        );
      }

      return data<SignUpActionType>(
        {
          success: false,
          message: SERVER_ERROR_MESSAGES[error?.code || "UNKNOWN"],
          step: "OTP",
          otpSession,
        },
        { status: res.status },
      );
    }

    const newOtpExpiresAt = expiryFromNowSeconds(
      minutesToSeconds(
        (result.data as GenericResponse).expires_in_minutes || 5,
      ),
    );

    // Reset cooldown after successful resend, increment count
    return data<SignUpActionType>({
      success: true,
      message: "Verification code has been resent successfully",
      step: "OTP",
      otpSession: {
        email,
        otpExpiresAt: newOtpExpiresAt,
        resendCount: resendCount + 1,
        resendAvailableAt: undefined, // Clear cooldown
      },
    });
  } catch (err) {
    return data<SignUpActionType>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
        step: "OTP",
        otpSession,
      },
      { status: 500 },
    );
  }
}

// -------------------------------------
// Google Auth
// -------------------------------------
export async function getGoogleAuthUrl() {
  try {
    const res = await fetch(BASE_URL + GOOGLE_AUTH_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<SignUpActionType>(
          handleRateLimitError("EMAIL", error.details?.retry_after),
          { status: res.status },
        );
      }

      return data<SignUpActionType>(
        { ...genericErrorState(), step: "EMAIL" },
        { status: res.status },
      );
    }

    const authUrl = (result.data as GenericResponse)?.auth_url;
    if (!authUrl) {
      return data<SignUpActionType>(
        { ...genericErrorState(), step: "EMAIL" },
        { status: 500 },
      );
    }

    // Redirect to Google OAuth
    return redirect(authUrl);
  } catch (err) {
    return data<SignUpActionType>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
        step: "EMAIL",
      },
      { status: 500 },
    );
  }
}

export async function handleGoogleOAuthCallback(code: string, redirectTo?: string) {
  try {
    const res = await fetch(BASE_URL + GOOGLE_CALLBACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;
      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<SignUpActionType>(
          handleRateLimitError("EMAIL", error.details?.retry_after),
          { status: res.status },
        );
      }

      return data<SignUpActionType>(
        {
          success: false,
          message: SERVER_ERROR_MESSAGES[error?.code as keyof typeof SERVER_ERROR_MESSAGES] ?? SERVER_ERROR_MESSAGES.UNKNOWN,
          step: "EMAIL",
        },
        { status: res.status },
      );
    }

    const resData = result.data as ExtendedUser;
    const accessToken = resData.access_token;
    const refreshToken = resData.refresh_token;
    const user = resData.user;

    if (!accessToken || !refreshToken || !user) {
      return data<SignUpActionType>(
        { ...genericErrorState(), step: "EMAIL" },
        { status: 500 },
      );
    }

    return redirect(redirectTo || "/dashboard", {
      headers: {
        "Set-Cookie": await sessionCookie.serialize({
          accessToken,
          refreshToken,
          user,
        }),
      },
    });
  } catch (err) {
    return data<SignUpActionType>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
        step: "EMAIL",
      },
      { status: 500 },
    );
  }
}

// -------------------------------------
// EMAIL SIGNIN
// -------------------------------------
export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string | undefined;
  const password = formData.get("password") as string | undefined;
  const redirectTo = formData.get("redirectTo") as string | undefined;

  const errors: Record<string, string> = {};

  if (!email) errors.email = "Please enter your email address.";

  if (!password) {
    errors.password = "Please enter your password.";
  } else if (password.length < 8) {
    errors.password = "Your password needs to be at least 8 characters long.";
  }

  if (Object.keys(errors).length > 0) {
    return data<SignUpActionType>(
      { success: false, errors, step: "EMAIL" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(BASE_URL + SIGNIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<SignUpActionType>(
          handleRateLimitError("EMAIL", error.details?.retry_after),
          {
            status: res.status,
          },
        );
      }

      if (error?.code === "VALIDATION_ERROR") {
        return data<SignUpActionType>(
          { success: false, message: error.message, step: "EMAIL" },
          { status: res.status },
        );
      }

      return data<SignUpActionType>(
        {
          success: false,
          message: SERVER_ERROR_MESSAGES[error?.code || "UNKNOWN"],
          step: "EMAIL",
        },
        {
          status: res.status,
        },
      );
    }

    const otpExpiresAt = expiryFromNowSeconds(
      minutesToSeconds(
        (result.data as GenericResponse)?.expires_in_minutes || 5,
      ),
    );

    return data<SignUpActionType>({
      success: true,
      step: "OTP",
      otpSession: {
        email: email!,
        otpExpiresAt,
        resendCount: 0,
        redirectTo,
      },
    });
  } catch (err) {
    return data<SignUpActionType>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
      },
      { status: 500 },
    );
  }
}

// -------------------------------------
// FORGOT PASSWORD
// -------------------------------------
export async function sendPasswordResetLink(
  formData: FormData,
  otpSession?: OTPSessionData,
) {
  const email = formData.get("email") as string | undefined;

  if (!email)
    return data<ServerActionState>(
      { success: false, errors: { email: "Please enter your email address." } },
      { status: 400 },
    );

  // Check if still in cooldown period
  if (
    otpSession?.resendAvailableAt &&
    Date.now() < otpSession?.resendAvailableAt
  ) {
    const secondsLeft = Math.ceil(
      (otpSession?.resendAvailableAt - Date.now()) / 1000,
    );
    return data<SignUpActionType>(
      {
        success: false,
        message: getRateLimitMessage(secondsLeft),
        otpSession,
      },
      { status: 429 },
    );
  }

  // Soft limit: 3 attempts before triggering soft cooldown
  if (
    otpSession?.resendCount &&
    otpSession.resendCount >= MAX_RESEND_ATTEMPTS &&
    !otpSession?.resendAvailableAt
  ) {
    const softCooldownAt = expiryFromNowSeconds(
      minutesToSeconds(SOFT_COOLDOWN_MINUTES),
    );

    return data<SignUpActionType>(
      {
        success: false,
        message: getRateLimitMessage(minutesToSeconds(SOFT_COOLDOWN_MINUTES)),
        otpSession: {
          ...otpSession,
          resendAvailableAt: softCooldownAt,
        },
      },
      { status: 429 },
    );
  }

  try {
    const res = await fetch(BASE_URL + FORGOT_PASSWORD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email }),
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<SignUpActionType>(
          handleRateLimitError(
            "OTP",
            error.details?.retry_after,
            otpSession
              ? {
                  ...otpSession,
                  resendCount: MAX_RESEND_ATTEMPTS, // Max out to prevent further attempts
                }
              : undefined,
          ),
          { status: res.status },
        );
      }

      if (error?.code === "VALIDATION_ERROR") {
        return data<SignUpActionType>(
          { success: false, message: error.message, otpSession },
          { status: res.status },
        );
      }

      return data<SignUpActionType>(
        {
          success: false,
          message: SERVER_ERROR_MESSAGES[error?.code || "UNKNOWN"],
          otpSession,
        },
        {
          status: res.status,
        },
      );
    }

    const otpExpiresAt = expiryFromNowSeconds(
      minutesToSeconds(
        (result.data as GenericResponse)?.expires_in_minutes || 5,
      ),
    );

    return data<SignUpActionType>(
      {
        success: true,
        otpSession: {
          email: email || otpSession?.email || "",
          otpExpiresAt,
          resendCount: (otpSession?.resendCount || 0) + 1,
          resendAvailableAt: undefined, // Clear cooldown
        },
      },
      { status: res.status },
    );
  } catch (err) {
    return data<SignUpActionType>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
        otpSession,
      },
      { status: 500 },
    );
  }
}

// -------------------------------------
// RESET PASSWORD
// -------------------------------------
export async function resetPassword(formData: FormData, token: string) {
  const password = formData.get("password") as string | undefined;
  const confirm = formData.get("confirm-password") as string | undefined;

  const errors: Record<string, string> = {};

  if (!password) {
    errors.password = "Please enter your password.";
  } else {
    const failedRule = passwordRules.find((rule) => !rule.test(password));
    if (failedRule) errors.password = failedRule.message;
  }

  if (!confirm) {
    errors.confirm = "Please confirm your password.";
  } else if (confirm !== password) {
    errors.confirm = "The passwords you entered don’t match. Please try again.";
  }

  if (Object.keys(errors).length > 0) {
    return data<ServerActionState>({ success: false, errors }, { status: 400 });
  }

  try {
    const res = await fetch(BASE_URL + RESET_PASSWORD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        new_password: password,
        confirm_new_password: password,
      }),
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<ServerActionState>(
          {
            success: false,
            message: getRateLimitMessage(error.details?.retry_after),
          },
          { status: res.status },
        );
      }

      if (error?.code === "VALIDATION_ERROR") {
        return data<ServerActionState>(
          { success: false, message: error.message },
          { status: res.status },
        );
      }

      return data<ServerActionState>(
        {
          success: false,
          message: SERVER_ERROR_MESSAGES[error?.code || "UNKNOWN"],
        },
        {
          status: res.status,
        },
      );
    }

    return redirect("/auth/signin");
  } catch (err) {
    return data<ServerActionState>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
      },
      { status: 500 },
    );
  }
}

// -------------------------------------
// -------------------------------------
export async function signOut(accessToken: string) {
  try {
    const res = await fetch(BASE_URL + SIGNOUT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<ServerActionState>(
          {
            success: false,
            message: getRateLimitMessage(error.details?.retry_after),
          },
          { status: res.status },
        );
      }

      if (error?.code === "VALIDATION_ERROR") {
        return data<ServerActionState>(
          { success: false, message: error.message },
          { status: res.status },
        );
      }

      return data<ServerActionState>(
        {
          success: false,
          message: SERVER_ERROR_MESSAGES[error?.code || "UNKNOWN"],
        },
        {
          status: res.status,
        },
      );
    }

    // Always clear session cookie
    return redirect("/auth/signin", { headers: await destroySession() });
  } catch (err) {
    return data<ServerActionState>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
      },
      { status: 500 },
    );
  }
}
