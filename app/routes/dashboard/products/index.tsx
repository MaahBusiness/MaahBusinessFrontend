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
import { Package, TrendingDown, Boxes } from "lucide-react";
import { useMemo } from "react";
import { formatDisplayAmount } from "utils";

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

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed refetch={refetch} />;

  return (
    <div className="dashboard-page relative min-h-full overflow-x-hidden">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
        <div className="mb-5 space-y-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Product catalog
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage inventory, pricing, and promotions for your store.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
              <div className="flex items-center gap-2 text-violet-600">
                <Package className="size-4" />
                <span className="text-[10px] font-semibold uppercase">Products</span>
              </div>
              <p className="mt-1 text-xl font-bold tabular-nums">{products.length}</p>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
              <div className="flex items-center gap-2 text-orange-600">
                <Boxes className="size-4" />
                <span className="text-[10px] font-semibold uppercase">Low stock</span>
              </div>
              <p className="mt-1 text-xl font-bold tabular-nums">{stats.lowStock}</p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="flex items-center gap-2 text-rose-600">
                <TrendingDown className="size-4" />
                <span className="text-[10px] font-semibold uppercase">On promo</span>
              </div>
              <p className="mt-1 text-xl font-bold tabular-nums">{stats.onPromo}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:col-span-1">
              <p className="text-[10px] font-semibold uppercase text-emerald-600">
                Stock value
              </p>
              <p className="mt-1 text-lg font-bold sm:text-xl">
                {formatDisplayAmount(stats.totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-violet-500/15 bg-card/80 shadow-sm backdrop-blur-sm">
          <DataTable
            data={products}
            meta={res.meta}
            columns={cols}
            DataTableToolbar={ProductTableToolbar}
          />
        </div>
      </div>
    </div>
  );
}
