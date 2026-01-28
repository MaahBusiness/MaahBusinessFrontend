import type { Route } from ".react-router/types/app/routes/dashboard/team/+types";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { columns } from "@/components/team/team-columns";
import { TeamTableToolbar } from "@/components/team/team-table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { redirect, useNavigation, useParams } from "react-router";
import { toast } from "sonner";
import type { OrganisationMember, Role, ServerActionState } from "types";
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

    case "update-member": {
      const memberId = formData.get("id") as string | undefined;
      const role = formData.get("role") as Role | undefined;
      const isChecked = formData.get("sswitch") as string | undefined;
      const status = formData.get("status") as string | undefined;

      if (session?.accessToken && memberId)
        return await organisationsApi.updateMember(
          session.accessToken,
          id,
          memberId,
          {
            role,
            is_active: isChecked ? (Boolean(status) ? false : true) : undefined,
          },
        );
    }

    default:
      return genericErrorState();
  }
}

export default function TeamPage({ actionData }: Route.ComponentProps) {
  const { user } = useAuth(); // Get token from context
  const { members: res, isLoadingMembers } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const navigation = useNavigation();
  const intent = navigation.formData?.get("intent");

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

      if (intent === "update-member" && actionData?.success)
        toast.success(
          `${actionData.data?.user?.name} has been updated successfully!`,
        );

      if (intent === "add-member")
        toast.success("New member has been added succesfully!");
    }
  }, [actionData]);

  if (isLoadingMembers) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed />;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <h2 className="text-lg tracking-tight">Team</h2>
      </div>

      <DataTable
        data={res?.data ?? []}
        meta={res.meta}
        columns={cols}
        DataTableToolbar={TeamTableToolbar}
      />
    </div>
  );
}
