import type { Route } from ".react-router/types/app/routes/dashboard/sales/+types";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { invoiceCols } from "@/components/sales/invoice-columns";
import { InvoiceTableToolbar } from "@/components/sales/invoice-table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { useOrganisation } from "@/hooks/use-organisation";
import { RequestFailed } from "@/routes/404";
import { useSearchParams } from "react-router";
import type { InvoiceFilters } from "types";
import { invoiceFilterParsers, parseSearchParams } from "utils";

export default function SalesPage({}: Route.ComponentProps) {
  const { fetchInvoices } = useOrganisation();
  const [searchParams] = useSearchParams();
  const filters = parseSearchParams<InvoiceFilters>(
    searchParams,
    invoiceFilterParsers,
  );
  const { data: res, isLoading } = fetchInvoices(filters);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed />;

  return (
    <div className="dashboard-page relative min-h-full overflow-x-hidden">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-6xl px-3 py-4 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
        <div className="mb-5 min-w-0 space-y-2 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Sales & invoices
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track invoices, payments, and due amounts with flexible filters.
            </p>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-violet-500/15 bg-card/80 shadow-sm backdrop-blur-sm">
          <DataTable
            data={res.data ?? []}
            meta={res.meta}
            columns={invoiceCols}
            density="compact"
            DataTableToolbar={InvoiceTableToolbar}
          />
        </div>
      </div>
    </div>
  );
}
