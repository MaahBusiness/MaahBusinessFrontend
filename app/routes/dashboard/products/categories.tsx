import { catCols } from "@/components/categories/cat-columns";
import { CatTableToolbar } from "@/components/categories/cat-table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { redirect, useNavigation, useParams } from "react-router";
import { toast } from "sonner";
import type { Category, ServerActionState, Subcategory } from "types";
import { genericErrorState } from "utils";
import type { Route } from ".react-router/types/app/routes/dashboard/products/+types/categories";
import { ChevronRight } from "lucide-react";
import { useOrganisation } from "@/hooks/use-organisation";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { RequestFailed } from "@/routes/404";

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
  const { organisation: res, isLoading } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigation = useNavigation();
  const intent = navigation.formData?.get("intent");

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

      if (intent === "update-category")
        toast.success(
          actionData?.data?.name + " " + " has been updated succesfully!",
        );

      if (intent === "add-category")
        toast.success(`New category has been added succesfully!`);
    }
  }, [actionData]);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed />;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        {/* <Link to="/products"> */}
        <h2 className="text-lg tracking-tight text-muted-foreground">
          Products
        </h2>
        {/* </Link> */}
        <ChevronRight className="text-muted-foreground size-4" />
        <h2 className="text-lg tracking-tight">Categories</h2>
      </div>

      <DataTable
        data={res?.data?.categories || []}
        meta={res.meta}
        columns={catCols}
        DataTableToolbar={CatTableToolbar}
      />
    </div>
  );
}
