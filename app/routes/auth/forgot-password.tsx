import type { Route } from ".react-router/types/app/routes/auth/+types/forgot-password";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { sendPasswordResetLink } from "@/lib/api/auth";
import { requireUserSession } from "@/lib/session.server";
import { useEffect } from "react";
import { sanitizeRedirectPath } from "utils/safe-redirect";
import { data, redirect } from "react-router";
import { toast } from "sonner";
import { SITE_NAME } from "types/consts";

export function meta() {
  return [
    { title: `${SITE_NAME} | Forgot Password` },
    { name: `description`, content: `Request a password reset link` },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  return sendPasswordResetLink(formData);
}

// ------------------------------
// Loader - redirect if already authenticated
// ------------------------------
export async function loader({ request }: Route.LoaderArgs) {
  const { session } = await requireUserSession(request);

  const url = new URL(request.url);
  const redirectTo = sanitizeRedirectPath(url.searchParams.get("redirectTo"));

  if (session) return redirect(redirectTo);

  return data({ redirectTo });
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }
  }, [actionData]);
  return <ForgotPasswordForm />;
}
