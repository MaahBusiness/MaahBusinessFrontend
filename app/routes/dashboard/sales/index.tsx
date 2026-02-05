import type { Route } from ".react-router/types/app/routes/dashboard/sales/+types";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { invoiceCols } from "@/components/sales/invoice-columns";
import { InvoiceTableToolbar } from "@/components/sales/invoice-table-toolbar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { useQueryClient } from "@tanstack/react-query";
import { Archive, ChevronRight } from "lucide-react";
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
import { hasPermission } from "utils/permissions";

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
  const { fetchInvoices, businessMember } = useOrganisation();
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

  const { data: res, isLoading, refetch } = fetchInvoices(filters);

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

  // useEffect(() => {
  //   const _filters = parseSearchParams<InvoiceFilters>(
  //     searchParams,
  //     invoiceFilterParsers,
  //   );
  //   console.log("Here ---");
  //   setFilters(_filters);
  // }, [searchParams]);

  // useEffect(() => {
  //   console.log("Here ++++++");
  // }, [filters]);

  if (isLoading || !res?.success) return <DataTableSkeleton />;
  if (res && !res?.success) return <RequestFailed refetch={refetch} />;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <h2 className="text-lg tracking-tight">Invoices</h2>

        <div className="ml-auto flex items-center justify-end">
          {hasPermission(businessMember?.role, "invoice:create") && (
            <Link
              to={"archived"}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Archive className="size-4" />
              Archived
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
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
