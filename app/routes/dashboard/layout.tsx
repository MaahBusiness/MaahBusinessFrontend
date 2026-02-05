import type { Route } from ".react-router/types/app/routes/dashboard/+types/layout";
import { SiteHeader } from "@/components/site-header";
import { signOut } from "@/lib/api/auth";
import { getSession, requireUserSession } from "@/lib/session.server";
import { useEffect } from "react";
import { Outlet, redirect, data } from "react-router";
import { toast } from "sonner";
import type { ServerActionState } from "types";
import { genericErrorState } from "utils";

// -------------------------------------
// ACTION ROUTER
// -------------------------------------
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const session = await getSession(request);

  const intent = formData.get("intent");

  switch (intent) {
    case "signout":
      if (session?.accessToken) return signOut(session.accessToken); // Call backend logout endpoint if session exists
      break;

    default:
      return data<ServerActionState>(genericErrorState(), { status: 400 });
  }
}

// ------------------------------
// Loader - protect all dashboard routes
// ------------------------------
export async function loader({ request }: Route.LoaderArgs) {
  const { session, headers } = await requireUserSession(request);

  // Redirect to signin if not authenticated
  if (!session) {
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;

    return redirect(
      `/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`,
      {
        headers,
      },
    );
  }

  return data(
    { session },
    { headers }, // <- important!
  );
}

export default function DashboardLayout({ actionData }: Route.ComponentProps) {
  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      console.log("Here 133311");

      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }
  }, [actionData]);
  return (
    <div className="[--header-height:calc(theme(spacing.12))] flex flex-col min-h-screen ">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
