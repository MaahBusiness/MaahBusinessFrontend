// signup.tsx
import type { Route } from ".react-router/types/app/routes/auth/+types/signup";
import { OTPForm } from "@/components/forms/otp-form";
import { SignupForm } from "@/components/forms/signup-form";
import {
  resendOTP,
  getGoogleAuthUrl,
  signUpWithEmail,
  verifyOTP,
} from "@/lib/api/auth";
import { requireUserSession } from "@/lib/session.server";
import { useEffect } from "react";
import { data, redirect } from "react-router";
import { toast } from "sonner";
import type { OTPSessionData, SignUpActionType } from "types";
import { genericErrorState } from "utils";

// export function meta({}: Route.MetaArgs) {
export function meta() {
  return [
    { title: "Sign up | RetailPulse" },
    { name: "description", content: "Create your account" },
  ];
}

// -------------------------------------
// ACTION ROUTER
// -------------------------------------
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Get OTP session from form data if present
  const otpSessionJson = formData.get("otpSession") as string | null;
  const otpSession: OTPSessionData | undefined = otpSessionJson
    ? JSON.parse(otpSessionJson)
    : undefined;

  switch (intent) {
    case "email-signup":
      return signUpWithEmail(formData);

    case "verify-otp":
      if (!otpSession) {
        return data<SignUpActionType>(
          { ...genericErrorState(), step: "EMAIL" },
          { status: 400 },
        );
      }
      return verifyOTP(formData, otpSession);

    case "resend-otp":
      if (!otpSession) {
        return data<SignUpActionType>(
          { ...genericErrorState(), step: "EMAIL" },
          { status: 400 },
        );
      }
      return resendOTP(otpSession);

    case "google-auth":
      return getGoogleAuthUrl();

    default:
      return data<SignUpActionType>(
        { ...genericErrorState(), step: "EMAIL" },
        { status: 400 },
      );
  }
}

// ------------------------------
// Loader - redirect if already authenticated
// ------------------------------
export async function loader({ request }: Route.LoaderArgs) {
  const { session } = await requireUserSession(request);

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";

  if (session) return redirect(redirectTo);

  return data({ redirectTo });
}

// -------------------------------------
// PAGE
// -------------------------------------
export default function SignupPage({ actionData }: Route.ComponentProps) {
  const showOtpForm = actionData?.step === "OTP";

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) {
        toast.error(actionData.message);
      } else if (actionData.step === "OTP") {
        toast.success(actionData.message);
      }
    }
  }, [actionData]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 tablet:p-10">
      <div className="w-full max-w-sm">
        {showOtpForm && actionData.otpSession ? <OTPForm /> : <SignupForm />}
      </div>
    </div>
  );
}
