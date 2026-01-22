import { catCols } from "@/components/categories/columns";
import { DataTableToolbar } from "@/components/categories/cat-table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/contexts/auth-context";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { catData } from "@/routes/dashboard/products/data";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { redirect, useParams } from "react-router";
import { toast } from "sonner";
import type { Category, Role, ServerActionState, Subcategory } from "types";
import { genericErrorState } from "utils";
import type { Route } from ".react-router/types/app/routes/dashboard/products/+types/categories";
import { ChevronRight } from "lucide-react";
import { useOrganisation } from "@/hooks/use-organisation";
import { Skeleton } from "@/components/ui/skeleton";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: Category | Subcategory;
  }
> {
  const { id } = params;
  if (!id) throw redirect("organisations");

  const formData = await request.formData();
  const session = await getSession(request);

  const intent = formData.get("intent");

  switch (intent) {
    case "add-category": {
      const name = formData.get("name") as string | undefined;
      const desc = formData.get("desc") as string | undefined;
      const parent = formData.get("parent") as string | undefined;

      if (session?.accessToken) {
        if (parent)
          return await organisationsApi.addSubCategory(
            session.accessToken,
            id,
            { name: name!, description: desc, category_id: parent },
          );
        return await organisationsApi.addCategory(session.accessToken, id, {
          name: name!,
          description: desc,
        });
      }
    }
    case "update-category": {
      const name = formData.get("name") as string | undefined;
      const desc = formData.get("desc") as string | undefined;
      const cat_id = formData.get("cat_id") as string | undefined;
      const parent = formData.get("parent") as string | undefined;

      if (session?.accessToken) {
        if (parent)
          return await organisationsApi.updateSubcategory(
            session.accessToken,
            cat_id!,
            { name: name!, description: desc },
          );
        return await organisationsApi.updateCategory(
          session.accessToken,
          cat_id!,
          {
            name: name!,
            description: desc,
          },
        );
      }
    }

    default:
      return genericErrorState();
  }
}

export default function CategoriesPage({ actionData }: Route.ComponentProps) {
  const { user } = useAuth(); // Get token from context
  const { organisation: res, isLoading } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id)
        // Automatically refetch core since categories come attached to the core
        queryClient.invalidateQueries({
          queryKey: organisationKeys.core(id),
        });
    }
  }, [actionData]);

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <h2 className="text-lg  tracking-tight">{`Products`}</h2>
        <ChevronRight />
        <h2 className="text-lg tracking-tight">Categories </h2>
      </div>

      {(isLoading || !res?.success) && (
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

      {res?.data && (
        <DataTable
          data={res?.data?.categories || []}
          columns={catCols}
          DataTableToolbar={DataTableToolbar}
        />
      )}
    </div>
  );
}
