import type { Route } from ".react-router/types/app/routes/dashboard/team/+types";
import { columns } from "@/components/team/columns";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { redirect } from "react-router";
import type { OrganisationCore, ServerActionState } from "types";
import { genericErrorState } from "utils";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: OrganisationCore;
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

    default:
      return genericErrorState();
  }
}

export default function TeamPage({ actionData }: Route.ComponentProps) {
  const { user } = useAuth(); // Get token from context
  const { members: res, isLoadingMembers } = useOrganisation();

  const cols = columns(user?.id || "");

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full">
        <h2 className="text-3xl font-bold tracking-tight">Team</h2>
      </div>

      {(isLoadingMembers || !res?.success) && (
        <div className="flex w-full flex-col gap-2 p-4 rounded-md border border-border">
          {Array.from({ length: 5 }).map((_, index) => (
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
