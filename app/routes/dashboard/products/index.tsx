import type { Route } from ".react-router/types/app/routes/dashboard/products/+types";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { productCols } from "@/components/products/product-columns";
import { ProductTableToolbar } from "@/components/products/product-table-toolbar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  redirect,
  useNavigation,
  useParams,
  useSearchParams,
  type SessionData,
} from "react-router";
import { handleProductActions } from "services/api";
import { toast } from "sonner";
import type { Product, ProductFilters, ServerActionState } from "types";
import {
  genericErrorState,
  parseSearchParams,
  productFilterParsers,
} from "utils";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: Product;
  }
> {
  const { id } = params;
  if (!id) throw redirect("organisations");

  const formData = await request.formData();
  const session = await getSession(request);

  return await handleProductActions({ formData, id, session });
}

export default function ProductsPage({ actionData }: Route.ComponentProps) {
  const { organisation: orgRes, fetchProducts } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  const filters = parseSearchParams<ProductFilters>(
    searchParams,
    productFilterParsers,
  );
  const intent = navigation.formData?.get("intent");

  const { data: res, isLoading, refetch } = fetchProducts(filters);
  const cols = productCols({ cats: orgRes?.data?.categories });

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id)
        // Automatically refetch products
        queryClient.invalidateQueries({
          queryKey: organisationKeys.prodlist(id, filters),
        });

      if (intent === "add-product")
        toast.success(`${actionData.data?.name} has been added succesfully!`);

      if (intent === "update-product")
        toast.success(`${actionData.data?.name} has been updated succesfully!`);
    }
  }, [actionData]);

  // useEffect(() => {
  // const _filters = parseSearchParams<ProductFilters>(
  //   searchParams,
  //   productFilterParsers,
  // );
  // setFilters(_filters);
  // }, [searchParams]);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed refetch={refetch} />;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <h2 className="text-lg tracking-tight">Products</h2>
      </div>

      <DataTable
        data={res.data ?? []}
        // data={productData}
        meta={res.meta}
        columns={cols}
        DataTableToolbar={ProductTableToolbar}
      />
    </div>
  );
}
