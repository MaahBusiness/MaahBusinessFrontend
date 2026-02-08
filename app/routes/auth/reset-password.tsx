import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import type { Route } from ".react-router/types/app/routes/auth/+types/reset-password";
import { useEffect } from "react";
import { toast } from "sonner";
import { requireUserSession } from "@/lib/session.server";
import { redirect } from "react-router";
import { resetPassword } from "@/lib/api/auth";

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";

  if (!token)
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`);

  const formData = await request.formData();
  return resetPassword(formData, token);
}

// ------------------------------
// Loader - redirect if already authenticated
// ------------------------------
export async function loader({ request }: Route.LoaderArgs) {
  const { session } = await requireUserSession(request);

  if (session) {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";
    return redirect(redirectTo);
  }

  return null;
}

export default function ResetPassword({ actionData }: Route.ComponentProps) {
  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }
  }, [actionData]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 tablet:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
