import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { redirect, useNavigation, useParams } from "react-router";
import { toast } from "sonner";
import type { Category, ServerActionState, Subcategory } from "types";
import { genericErrorState } from "utils";
import type { Route } from ".react-router/types/app/routes/dashboard/products/+types/categories";
import { useOrganisation } from "@/hooks/use-organisation";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { RequestFailed } from "@/routes/404";
import { CategoriesBrowser } from "@/components/categories/categories-browser";

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

      if (session?.accessToken) {
        return await organisationsApi.addCategory(session.accessToken, id, {
          name: name!,
          description: desc,
        });
      }
      break;
    }
    case "add-subcategory": {
      const name = formData.get("name") as string | undefined;
      const desc = formData.get("desc") as string | undefined;
      const parent = formData.get("parent") as string | undefined;

      if (session?.accessToken && parent) {
        return await organisationsApi.addSubCategory(session.accessToken, id, {
          name: name!,
          description: desc,
          category_id: parent,
        });
      }
      break;
    }
    case "update-category": {
      const name = formData.get("name") as string | undefined;
      const desc = formData.get("desc") as string | undefined;
      const cat_id = formData.get("cat_id") as string | undefined;
      const parent = formData.get("parent") as string | undefined;

      if (session?.accessToken && cat_id && name) {
        if (parent) {
          return await organisationsApi.updateSubcategory(
            session.accessToken,
            cat_id,
            { name, description: desc },
          );
        }
        return await organisationsApi.updateCategory(session.accessToken, cat_id, {
          name,
          description: desc,
        });
      }
      break;
    }
    case "delete-category": {
      const cat_id = formData.get("cat_id") as string | undefined;
      if (session?.accessToken && cat_id) {
        return await organisationsApi.deleteCategory(session.accessToken, cat_id);
      }
      break;
    }
    case "delete-subcategory": {
      const cat_id = formData.get("cat_id") as string | undefined;
      if (session?.accessToken && cat_id) {
        return await organisationsApi.deleteSubcategory(session.accessToken, cat_id);
      }
      break;
    }

    default:
      return genericErrorState();
  }
  return genericErrorState();
}

export default function CategoriesPage({ actionData }: Route.ComponentProps) {
  const { organisation: res, isLoading } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigation = useNavigation();
  const intent = navigation.formData?.get("intent");

  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.core(id),
        });
      }

      if (intent === "update-category") {
        toast.success(`${actionData?.data?.name} updated successfully!`);
      }
      if (intent === "add-category") {
        toast.success("Category created successfully!");
      }
      if (intent === "add-subcategory") {
        toast.success("Subcategory created successfully!");
      }
      if (intent === "delete-category") {
        toast.success("Category deleted successfully!");
      }
      if (intent === "delete-subcategory") {
        toast.success("Subcategory deleted successfully!");
      }
    }
  }, [actionData, id, intent, queryClient]);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed />;

  return (
    <div className="dashboard-page relative min-h-full overflow-x-hidden">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />

      <div className="relative z-10 mx-auto w-full max-w-3xl overflow-x-hidden px-3 py-4 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
        <CategoriesBrowser categories={res.data?.categories ?? []} />
      </div>
    </div>
  );
}
