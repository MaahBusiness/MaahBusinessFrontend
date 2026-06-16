import type { Route } from ".react-router/types/app/routes/dashboard/products/+types";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { productCols } from "@/components/products/product-columns";
import { ProductTableToolbar } from "@/components/products/product-table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { useOrganisation } from "@/hooks/use-organisation";
import { useProductActionFeedback } from "@/hooks/use-product-action-feedback";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { redirect, useParams, useSearchParams } from "react-router";
import { handleProductActions } from "services/api";
import type { Product, ProductFilters, ServerActionState } from "types";
import { genericErrorState, parseSearchParams, productFilterParsers } from "utils";
import { Package, TrendingDown, Boxes, Barcode } from "lucide-react";
import { useMemo } from "react";
import { formatDisplayAmount } from "utils";
import { ProductStatsGrid } from "@/components/products/product-stats-grid";

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
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const filters = parseSearchParams<ProductFilters>(
    searchParams,
    productFilterParsers,
  );

  const { data: res, isLoading, refetch } = fetchProducts(filters);
  const cols = productCols({ cats: orgRes?.data?.categories });

  useProductActionFeedback(actionData, id);

  const products = res?.data ?? [];

  const stats = useMemo(() => {
    const lowStock = products.filter(
      (p) => p.min_quantity > 0 && p.quantity <= p.min_quantity,
    ).length;
    const onPromo = products.filter((p) => p.on_promotion).length;
    const totalValue = products.reduce(
      (sum, p) => sum + Number(p.unit_price) * Number(p.quantity || 0),
      0,
    );
    return { lowStock, onPromo, totalValue };
  }, [products]);

  const statItems = useMemo(
    () => [
      {
        label: "Products",
        value: products.length,
        accent: "violet" as const,
        icon: Package,
      },
      {
        label: "Low stock",
        value: stats.lowStock,
        accent: "orange" as const,
        icon: Boxes,
      },
      {
        label: "On promo",
        value: stats.onPromo,
        accent: "rose" as const,
        icon: TrendingDown,
      },
      {
        label: "Stock value",
        value: formatDisplayAmount(stats.totalValue),
        accent: "emerald" as const,
        icon: Barcode,
      },
    ],
    [products.length, stats],
  );

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success)
    return (
      <RequestFailed
        refetch={refetch}
        message={res?.message ?? genericErrorState().message}
      />
    );

  return (
    <div className="dashboard-page relative min-h-full overflow-x-hidden">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-6xl px-3 py-4 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
        <div className="mb-5 min-w-0 space-y-4 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Product catalog
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage inventory, pricing, and promotions for your store.
            </p>
          </div>

          <ProductStatsGrid items={statItems} />
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-violet-500/15 bg-card/80 shadow-sm backdrop-blur-sm">
          <DataTable
            data={products}
            meta={res.meta}
            columns={cols}
            density="compact"
            DataTableToolbar={ProductTableToolbar}
          />
        </div>
      </div>
    </div>
  );
}
