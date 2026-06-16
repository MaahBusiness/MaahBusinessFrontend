import { DataTable } from "@/components/ui/data-table";
import {
  Link,
  redirect,
  useNavigation,
  useParams,
  useSearchParams,
} from "react-router";
import { ChevronRight } from "lucide-react";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import type {
  ServerActionState,
  Category,
  Subcategory,
  ProductFilters,
  Product,
} from "types";
import {
  genericErrorState,
  parseSearchParams,
  productFilterParsers,
} from "utils";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOrganisation } from "@/hooks/use-organisation";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { RequestFailed } from "@/routes/404";
import { productCols } from "@/components/products/product-columns";
import { ProductTableToolbar } from "@/components/products/product-table-toolbar";
import { handleProductActions } from "services/api";
import type { Route } from ".react-router/types/app/routes/dashboard/products/+types/single-sub-cat";
import { SingleCatActions } from "@/components/categories/single-cat-action";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: Category | Subcategory | Product;
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
      break;
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
      break;
    }

    // Handle Product Actions
    default:
      return await handleProductActions({ formData, id, session });
  }

  return genericErrorState();
}

export default function SingleCatPage({ actionData }: Route.ComponentProps) {
  const { catId, id, subId } = useParams();
  const { organisation: res, isLoading, fetchProducts } = useOrganisation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  const filters = parseSearchParams<ProductFilters>(
    searchParams,
    productFilterParsers,
  );

  if (!catId) throw redirect("categories");

  const cat = res?.data?.categories?.find((cat) => cat.id === catId);
  const sub = cat?.subcategories?.find((cat) => cat.id === subId);

  const intent = navigation.formData?.get("intent");

  const { data: prodRes } = fetchProducts({
    ...filters,
    // category_id: cat?.id,
    subcategory_id: sub?.id,
  });
  const cols = productCols({ cats: res?.data?.categories });

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id) {
        if (intent === "add-product" || intent === "update-product")
          queryClient.invalidateQueries({
            queryKey: organisationKeys.prodlist(id, filters),
          });
        // Automatically refetch core since categories come attached to the core
        queryClient.invalidateQueries({
          queryKey: organisationKeys.core(id),
        });
      }
    }
  }, [actionData]);

  // useEffect(() => {
  //   const _filters = parseSearchParams<ProductFilters>(
  //     searchParams,
  //     productFilterParsers,
  //   );
  //   setFilters({
  //     ..._filters,
  //     // category_id: cat?.id,
  //     subcategory_id: sub?.id,
  //   });
  // }, [searchParams]);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed />;

  return (
    <>
      <div className="w-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
        <div className="w-full flex flex-col tablet:flex-row tablet:items-center gap-4">
          <div className="w-auto flex items-center gap-2 overflow-x-scroll no-scrollbar">
            <Link to="../products">
              <h2 className="text-lg tracking-tight text-muted-foreground">
                Products
              </h2>
            </Link>
            <ChevronRight className="text-muted-foreground size-4" />
            <Link to="../products/categories">
              <h2 className="text-lg tracking-tight text-muted-foreground">
                Categories
              </h2>
            </Link>
            <ChevronRight className="text-muted-foreground size-4" />
            <Link to={`../products/categories/${cat?.id}`} className="shrink-0">
              <h2 className="text-lg tracking-tight text-muted-foreground ">
                {cat?.name}
              </h2>
            </Link>
            <ChevronRight className="text-muted-foreground size-4" />
            <h2 className="text-lg tracking-tight shrink-0">{sub?.name}</h2>
          </div>

          <div className="tablet:ml-auto flex items-center tablet:justify-end">
            {sub && <SingleCatActions data={sub} />}
          </div>
        </div>

        <DataTable
          data={prodRes?.data ?? []}
          // data={productData}
          meta={res.meta}
          columns={cols}
          DataTableToolbar={ProductTableToolbar}
        />
      </div>
    </>
  );
}
