import type { Route } from ".react-router/types/app/routes/dashboard/team/+types";
import { columns } from "@/components/team/columns";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { redirect, useParams } from "react-router";
import { toast } from "sonner";
import type {
  OrganisationCore,
  OrganisationMember,
  Role,
  ServerActionState,
} from "types";
import { genericErrorState, passwordRules } from "utils";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: OrganisationMember;
  }
> {
  const { id } = params;
  if (!id) throw redirect("organisations");

  const formData = await request.formData();
  const session = await getSession(request);

  const intent = formData.get("intent");

  switch (intent) {
    case "delete-user": {
      const userId = formData.get("userId") as string | undefined;

      if (session?.accessToken && userId)
        return await organisationsApi.removeMember(
          session.accessToken,
          id,
          userId,
        );
    }

    case "add-member": {
      const role = formData.get("role") as Role | undefined;
      const email = formData.get("email") as string | undefined;
      const name = formData.get("name") as string | undefined;
      const password = formData.get("password") as string | undefined;

      const errors: Record<string, string> = {};

      if (!email) errors.email = "Please provide an email address.";
      if (!role) errors.role = "Please select a role.";
      else if (role === "owner")
        errors.role = "Please select a different role.";

      if (password) {
        const failedRule = passwordRules.find((rule) => !rule.test(password));
        if (failedRule) errors.password = failedRule.message;
      }

      if (Object.keys(errors).length > 0) return { success: false, errors };

      if (session?.accessToken)
        return await organisationsApi.addMemberByEmail(
          session.accessToken,
          id,
          {
            name: name || email,
            email: email!,
            password,
            role: role!,
          },
        );
    }

    default:
      return genericErrorState();
  }
}

export default function CustomersPage({ actionData }: Route.ComponentProps) {
  const { user } = useAuth(); // Get token from context
  const { members: res, isLoadingMembers } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const cols = columns(user?.id || "");

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id)
        // Automatically refetch members
        queryClient.invalidateQueries({
          queryKey: organisationKeys.members(id),
        });
    }
  }, [actionData]);

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full">
        <h2 className="text-3xl font-bold tracking-tight">Team</h2>
      </div>

      {(isLoadingMembers || !res?.success) && (
        <div className="flex w-full flex-col gap-2 p-4 rounded-md border border-border">
          {Array.from({ length: 10 }).map((_, index) => (
            <div className="flex gap-4" key={index}>
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* {!res?.data?.res && <div>No Team Members</div>} */}

      {res?.data && <DataTable data={res?.data || []} columns={cols} />}
    </div>
  );
}
