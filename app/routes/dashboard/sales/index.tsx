import type { Route } from ".react-router/types/app/routes/dashboard/sales/+types";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { invoiceCols } from "@/components/sales/invoice-columns";
import { DataTable } from "@/components/ui/data-table";
import { useOrganisation } from "@/hooks/use-organisation";
import { RequestFailed } from "@/routes/404";
import { useSearchParams } from "react-router";
import type { Table } from "@tanstack/react-table";
import type { InvoiceFilters } from "types";
import { invoiceFilterParsers, parseSearchParams } from "utils";

function InvoicesToolbar<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} invoices
      </p>
    </div>
  );
}

export default function SalesPage({}: Route.ComponentProps) {
  const cols = invoiceCols();
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
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <h2 className="text-lg tracking-tight">Invoices</h2>
      </div>

      <DataTable
        data={res.data ?? []
        }
        meta={res.meta}
        columns={cols}
        DataTableToolbar={InvoicesToolbar}
      />
    </div>
  );
}
