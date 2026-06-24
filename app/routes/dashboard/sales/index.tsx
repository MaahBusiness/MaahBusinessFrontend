import type { Route } from ".react-router/types/app/routes/dashboard/sales/+types";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { invoiceCols } from "@/components/sales/invoice-columns";
import { CreateInvoiceDrawer } from "@/components/sales/invoice-add-new-drawer";
import { InvoiceTableToolbar } from "@/components/sales/invoice-table-toolbar";
import { ProductStatsGrid } from "@/components/products/product-stats-grid";
import { OrgPageShell } from "@/components/layout/org-page-shell";
import { QueryHydration } from "@/components/layout/query-hydration";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useOrganisation } from "@/hooks/use-organisation";
import { useSalesActionFeedback } from "@/hooks/use-sales-action-feedback";
import {
  createOrgPrefetchLoader,
  prefetchInvoices,
} from "@/lib/query.server";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { redirect, useParams, useSearchParams } from "react-router";
import { handleSalesActions } from "services/api";
import type { Invoice, InvoiceFilters, ServerActionState } from "types";
import {
  invoiceFilterParsers,
  parseSearchParams,
  formatDisplayAmount,
} from "utils";
import { hasPermission } from "utils/permissions";
import { isOrgAccessDenied } from "@/lib/org-access";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Plus, Receipt, Wallet } from "lucide-react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const filters = parseSearchParams<InvoiceFilters>(
    url.searchParams,
    invoiceFilterParsers,
  );

  return createOrgPrefetchLoader(request, params.id, (queryClient, token, orgId) =>
    prefetchInvoices(queryClient, token, orgId, filters),
  );
}

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: Invoice;
  }
> {
  const { id } = params;
  if (!id) throw redirect("organisations");

  const formData = await request.formData();
  const session = await getSession(request);

  return await handleSalesActions({ formData, id, session });
}

export default function SalesPage({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const { fetchInvoices, businessMember } = useOrganisation();
  const { id: orgId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseSearchParams<InvoiceFilters>(
    searchParams,
    invoiceFilterParsers,
  );
  const { data: res, isLoading } = fetchInvoices(filters);

  const [createOpen, setCreateOpen] = useState(false);
  const wantsNewSale = searchParams.get("new") === "1";

  useEffect(() => {
    if (!wantsNewSale) return;
    setCreateOpen(true);
    setSearchParams(
      (params) => {
        params.delete("new");
        return params;
      },
      { replace: true },
    );
  }, [wantsNewSale, setSearchParams]);

  useSalesActionFeedback(actionData, orgId);

  const invoices = res?.data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const canCreate = hasPermission(businessMember?.role, "invoice:create");
  const isCashier = businessMember?.role === "cashier";
  const cols = useMemo(() => invoiceCols(orgId), [orgId]);

  const statItems = useMemo(() => {
    const todayInvoices = invoices.filter((inv) =>
      inv.created_at?.startsWith(today),
    );
    const todayRevenue = todayInvoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0,
    );
    const amountDue = invoices.reduce(
      (sum, inv) => sum + Number(inv.remaining_amount || 0),
      0,
    );
    const completed = invoices.filter((inv) => inv.status === "COMPLETED").length;

    return [
      {
        label: "Invoices",
        value: String(res?.meta?.count ?? invoices.length),
        accent: "violet" as const,
        icon: Receipt,
        hint: "In current list",
      },
      {
        label: "Today's revenue",
        value: formatDisplayAmount(todayRevenue),
        accent: "emerald" as const,
        icon: Wallet,
        hint: `${todayInvoices.length} today`,
      },
      {
        label: "Amount due",
        value: formatDisplayAmount(amountDue),
        accent: "orange" as const,
        icon: Clock3,
        hint: "Outstanding balance",
      },
      {
        label: "Completed",
        value: String(completed),
        accent: "rose" as const,
        icon: CheckCircle2,
        hint: "Paid invoices",
      },
    ];
  }, [invoices, res?.meta?.count, today]);

  if (isLoading && !res) {
    return (
      <QueryHydration state={loaderData?.dehydratedState}>
        <DataTableSkeleton />
      </QueryHydration>
    );
  }
  if (!res?.success) {
    return (
      <QueryHydration state={loaderData?.dehydratedState}>
        <RequestFailed
          message={
            isOrgAccessDenied(res?.message)
              ? undefined
              : res?.message
          }
        />
      </QueryHydration>
    );
  }

  return (
    <QueryHydration state={loaderData?.dehydratedState}>
    <OrgPageShell>
      <div className="mb-1 min-w-0 space-y-4 sm:mb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {isCashier ? "Point of sale" : "Sales"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Record sales, scan products, and track invoices and payments.
            </p>
          </div>
          {canCreate && (
            <CreateInvoiceDrawer
              variant="hero"
              open={createOpen}
              onOpenChange={setCreateOpen}
            />
          )}
        </div>

        <ProductStatsGrid items={statItems} />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-violet-500/15 bg-card/80 shadow-sm backdrop-blur-sm">
        {invoices.length === 0 && !searchParams.toString() && canCreate ? (
          <Empty className="border-0 bg-transparent py-12 sm:py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Ready for your first sale</EmptyTitle>
              <EmptyDescription className="max-w-sm text-pretty">
                Scan a barcode, select a customer, and record payment in a few
                steps.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              className="auth-submit-btn gap-2 border-0"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              New sale
            </Button>
          </Empty>
        ) : (
          <DataTable
            data={invoices}
            meta={res.meta}
            columns={cols}
            density="compact"
            DataTableToolbar={InvoiceTableToolbar}
          />
        )}
      </div>
    </OrgPageShell>
    </QueryHydration>
  );
}
