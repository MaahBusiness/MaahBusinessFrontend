import type { Route } from ".react-router/types/app/routes/dashboard/sales/+types/archived";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { invoiceCols } from "@/components/sales/invoice-columns";
import { InvoiceTableToolbar } from "@/components/sales/invoice-table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { useOrganisation } from "@/hooks/use-organisation";
import { useSalesActionFeedback } from "@/hooks/use-sales-action-feedback";
import { getSession } from "@/lib/session.server";
import { orgPath } from "@/lib/org-navigation";
import { RequestFailed } from "@/routes/404";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link, redirect, useParams, useSearchParams } from "react-router";
import { handleSalesActions } from "services/api";
import type { Invoice, InvoiceFilters, ServerActionState } from "types";
import { invoiceFilterParsers, parseSearchParams } from "utils";

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

export default function ArchivedInvoicesPage({
  actionData,
}: Route.ComponentProps) {
  const { fetchArchivedInvoices } = useOrganisation();
  const { id: orgId } = useParams();
  const [searchParams] = useSearchParams();

  const filters = parseSearchParams<InvoiceFilters>(
    searchParams,
    invoiceFilterParsers,
  );

  const { data: res, isLoading, refetch } = fetchArchivedInvoices(filters);
  const cols = useMemo(() => invoiceCols(orgId), [orgId]);

  useSalesActionFeedback(actionData, orgId);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed refetch={refetch} />;

  return (
    <div className="dashboard-page relative min-h-full overflow-x-hidden">
      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-3 py-4 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
        <div className="flex items-center gap-2">
          <Link to={orgPath(orgId, "invoices")}>
            <h2 className="text-lg tracking-tight text-muted-foreground hover:underline">
              Sales
            </h2>
          </Link>
          <ChevronRight className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold tracking-tight">Archived</h2>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-violet-500/15 bg-card/80 shadow-sm backdrop-blur-sm">
          <DataTable
            data={res.data ?? []}
            meta={res.meta}
            columns={cols}
            density="compact"
            DataTableToolbar={InvoiceTableToolbar}
          />
        </div>
      </div>
    </div>
  );
}
