// signup-form.tsx
import { useEffect } from "react";
import { CreateOrgForm } from "@/components/forms/create-org-form";
import type { ServerActionState } from "types";
import { genericErrorState } from "utils";
import { data } from "react-router";
import { getSession } from "@/lib/session.server";
import type { Route } from ".react-router/types/app/routes/dashboard/organisations/+types/new";
import { toast } from "sonner";
import { createOrg } from "services/api";

// -------------------------------------
// ACTION ROUTER
// -------------------------------------
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const session = await getSession(request);

  const intent = formData.get("intent");

  switch (intent) {
    case "create-org":
      if (session?.accessToken) return createOrg(formData, session.accessToken);

    default:
      return data<ServerActionState>(genericErrorState(), { status: 400 });
  }
}

// -------------------------------------
// PAGE
// -------------------------------------
export default function NewOrgPage({ actionData }: Route.ComponentProps) {
  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }
  }, [actionData]);

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-3xl lg:px-6 px-0 mx-auto pt-12 pb-12">
      <div className="w-full">
        <h1 className="text-2xl font-medium">Create a new organisation</h1>
        <h2 className="text-muted-foreground text-sm font-medium">
          Set up your organisation’s details. You can update everything later.
        </h2>
      </div>

      <CreateOrgForm />
    </div>
  );
}
