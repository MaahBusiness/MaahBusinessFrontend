// signup-form.tsx
import { useEffect } from "react";
import { CreateOrgForm } from "@/components/forms/create-org-form";
import type { OrganisationCore, ServerActionState } from "types";
import { genericErrorState } from "utils";
import { redirect, useNavigate } from "react-router";
import { getSession } from "@/lib/session.server";
import type { Route } from ".react-router/types/app/routes/dashboard/organisations/+types/new";
import { toast } from "sonner";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { useQueryClient } from "@tanstack/react-query";

// -------------------------------------
// ACTION ROUTER -- STILL USING IT THIS MUTATIONS
// -------------------------------------
export async function action({ request }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: OrganisationCore;
  }
> {
  const formData = await request.formData();
  const session = await getSession(request);

  const name = formData.get("name") as string | undefined;
  const desc = formData.get("desc") as string | undefined;
  const email = formData.get("email") as string | undefined;
  const phone = formData.get("phone") as string | undefined;
  const address = formData.get("address") as string | undefined;
  const pfp = formData.get("pfp") as File | undefined;
  const url = formData.get("url") as string | undefined;

  const errors: Record<string, string> = {};

  if (!name) errors.name = "Please enter your name.";
  if (!email) errors.email = "Please enter your email address.";
  if (!desc)
    errors.desc = "Please provide a description for your organisation.";

  if (Object.keys(errors).length > 0) return { success: false, errors };

  if (session?.accessToken)
    return await organisationsApi.create(session.accessToken, {
      name: name!,
      email: email!,
      description: desc!,
      address,
      phone_number: phone,
      logo: pfp || undefined,
      logo_url: url,
    });

  return genericErrorState();
}

// -------------------------------------
// PAGE
// -------------------------------------
export default function NewOrgPage({ actionData }: Route.ComponentProps) {
  const queryClient = useQueryClient();
  let navigate = useNavigate();

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.data) {
      // After creating/updating - refetch the list
      toast.success("Your organisation has been created successfully.");
      queryClient.invalidateQueries({ queryKey: organisationKeys.lists() });

      queryClient.setQueryData(
        organisationKeys.core(actionData?.data?.id),
        actionData.data,
      );
      navigate(`/dashboard/organisations/add-team?id=${actionData.data.id}`);
      // navigate(`/dashboard/org/${actionData.data.id}`);
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
