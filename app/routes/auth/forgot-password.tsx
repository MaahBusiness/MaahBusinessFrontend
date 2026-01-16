import type { Route } from ".react-router/types/app/routes/auth/+types/forgot-password";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { sendPasswordResetLink } from "@/lib/auth";
import { requireUserSession } from "@/lib/session.server";
import { useEffect } from "react";
import { data, redirect } from "react-router";
import { toast } from "sonner";

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
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";

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
  return (
    <div className="flex h-full  flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
