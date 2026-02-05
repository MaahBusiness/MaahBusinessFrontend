import type { Route } from ".react-router/types/app/routes/dashboard/sales/+types/archived";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { invoiceCols } from "@/components/sales/invoice-columns";
import { InvoiceTableToolbar } from "@/components/sales/invoice-table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  redirect,
  useNavigation,
  useParams,
  useSearchParams,
} from "react-router";
import { handleSalesActions } from "services/api";
import { toast } from "sonner";
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function InvoicesPage({ actionData }: Route.ComponentProps) {
  const { fetchArchivedInvoices } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  // const [filters, setFilters] = useState<InvoiceFilters>();

  const filters = parseSearchParams<InvoiceFilters>(
    searchParams,
    invoiceFilterParsers,
  );

  const intent = navigation.formData?.get("intent");

  const { data: res, isLoading, refetch } = fetchArchivedInvoices(filters);

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
          queryKey: organisationKeys.invoiceList(id, filters),
        });

      if (intent === "create-invoice")
        toast.success(
          `Invoice #${actionData.data?.number} has been created successfully`,
        );
    }
  }, [actionData]);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed refetch={refetch} />;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <Link to="../invoices">
          <h2 className="text-lg tracking-tight text-muted-foreground">
            Invoices
          </h2>
        </Link>
        <ChevronRight className="text-muted-foreground size-4" />
        <h2 className="text-lg tracking-tight">Archived</h2>
      </div>

      <DataTable
        data={res.data ?? []}
        // data={mockInvoices}
        meta={res.meta}
        columns={invoiceCols}
        DataTableToolbar={InvoiceTableToolbar}
      />
    </div>
  );
}
