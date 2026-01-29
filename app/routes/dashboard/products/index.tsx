import type { Route } from ".react-router/types/app/routes/dashboard/products/+types";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { productCols } from "@/components/products/product-columns";
import { ProductTableToolbar } from "@/components/products/product-table-toolbar";
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

export async function handleProductActions({
  formData,
  id,
  session,
}: {
  session?: SessionData | null;
  formData: FormData;
  id: string;
}) {
  const intent = formData.get("intent");

  const prodId = formData.get("id") as string | undefined;

  const name = formData.get("name") as string | undefined;
  const desc = formData.get("desc") as string | undefined;
  const code = formData.get("code") as string | undefined;
  const cat = formData.get("cat") as string | undefined;
  const subcat = formData.get("subcat") as string | undefined;
  const _purchase = formData.get("purchase") as string | undefined;
  const _unit = formData.get("unit") as string | undefined;
  const _qty = formData.get("qty") as string | undefined;
  const _min = formData.get("min") as string | undefined;
  const exp = formData.get("exp") as string | undefined;
  const onPromo = formData.get("on-promo") as string | undefined;
  const promoStart = formData.get("promo-start") as string | undefined;
  const promoEnd = formData.get("promo-end") as string | undefined;
  const _promo = formData.get("promo") as string | undefined;

  // Converting formatted amounts back to numbers
  const purchase = parseInt(`${_purchase}`.replace(/\D/g, ""), 10) || 0;
  const unit = parseInt(`${_unit}`.replace(/\D/g, ""), 10) || 0;
  const promo = parseInt(`${_promo}`.replace(/\D/g, ""), 10) || 0;

  // Converting string to actual numbers
  const qty = Number(_qty);
  const min = Number(_min);

  // For comparing the promo dates
  const isEarlier = (a?: string, b?: string) => {
    if (!a || !b) return;
    return new Date(a).getTime() < new Date(b).getTime();
  };

  const errors: Record<string, string> = {};

  if (!name) errors.name = "Please provide an product name.";
  if (!cat) errors.cat = "Please select a product category.";
  if (purchase <= 0) errors.purchase = "Please provide the purchase price.";
  if (unit <= 0) errors.unit = "Please provide the unit price.";
  else if (unit <= purchase)
    errors.unit = "Selling price must be greater than purchase price";
  if (min > qty)
    errors.min = "Low threshold should be lower than the initial quantity";

  if (onPromo) {
    if (promo <= 0) errors.promo = "Please provide the promotional price.";
    else if (promo >= unit)
      errors.promo = "Promotional price must be lower than selling price";
    if (!isEarlier(promoStart, promoEnd)) {
      errors.promo_end =
        "The promotion end date should be after the start date.";
    }
  }

  if (Object.keys(errors).length > 0) return { success: false, errors };
  switch (intent) {
    case "add-product": {
      if (session?.accessToken)
        return await organisationsApi.addProduct(session.accessToken, id, {
          business_id: id,
          name: name!,
          category_id: cat!,
          purchase_price: purchase,
          unit_price: unit,

          // Optional
          barcode: code,
          description: desc,
          expiry_date: exp,
          min_quantity: min > 0 ? min : undefined,
          quantity: qty > 0 ? qty : undefined,
          on_promotion: Boolean(onPromo) || false,
          promo_price: promo > 0 ? promo : unit,
          promotion_end_date: promoEnd,
          promotion_start_date: promoStart,
          subcategory_id: subcat,
        });
      break;
    }

    case "update-product": {
      if (session?.accessToken && prodId)
        return await organisationsApi.updateProduct(
          session.accessToken,
          prodId,
          {
            name: name,
            category_id: cat,
            purchase_price: purchase,
            unit_price: unit,
            barcode: code,
            description: desc,
            expiry_date: exp,
            min_quantity: min > 0 ? min : undefined,
            quantity: qty > 0 ? qty : undefined,
            subcategory_id: subcat,
          },
        );
      break;
    }

    default:
      return genericErrorState();
  }
  return genericErrorState();
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

  const { data: res, isLoading } = fetchProducts(filters);
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
  if (!res?.success) return <RequestFailed />;

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
