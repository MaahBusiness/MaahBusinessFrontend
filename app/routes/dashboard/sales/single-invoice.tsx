import type { Route } from ".react-router/types/app/routes/dashboard/sales/+types/single-invoice";
import {
  InvoiceReceiptModalPage,
  InvoiceReceiptSkeleton,
} from "@/components/sales/invoice-receipt-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys } from "@/lib/api/organisation";
import { orgPath } from "@/lib/org-navigation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, CircleDashed } from "lucide-react";
import { useEffect } from "react";
import { Link, redirect, useNavigation, useParams } from "react-router";
import { handleSalesActions } from "services/api";
import { toast } from "sonner";
import type { Invoice, ServerActionState } from "types";

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

export default function SingleInvoicepage({
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { id, invId } = useParams();
  const { fetchSingleInvoice, organisation } = useOrganisation();

  if (!invId) return <RequestFailed />;

  const intent = navigation.formData?.get("intent");
  const { data: res, isFetching, error, refetch } = fetchSingleInvoice(invId);

  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id && res?.data) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoiceList(id),
        });

        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoice(res?.data?.id),
        });

        queryClient.invalidateQueries({
          queryKey: organisationKeys.paymentList(id, { invoice: res.data.id }),
        });
      }

      if (intent === "update-invoice")
        toast.success(
          `Invoice #${actionData.data?.number} has been created successfully`,
        );
      if (intent === "credit-invoice")
        toast.success(
          `Invoice #${actionData.data?.number} has been credited successfully`,
        );
      if (intent === "refund")
        toast.success(
          `Invoice #${actionData.data?.number} has been refunded successfully`,
        );
    }
  }, [actionData]);

  if (isFetching) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="mx-4 w-full max-w-2xl">
          <InvoiceReceiptSkeleton />
        </div>
      </div>
    );
  }

  if (!res?.success || error) {
    return <RequestFailed refetch={refetch} />;
  }

  if (!res.data) return <InvoiceNotFound />;

  return (
    <InvoiceReceiptModalPage
      data={res.data}
      orgName={organisation?.data?.name}
    />
  );
}

function InvoiceNotFound() {
  const { id } = useParams();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Empty className="max-w-md rounded-xl border bg-card p-8 shadow-lg">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleDashed />
          </EmptyMedia>
          <EmptyTitle>We couldn’t find this invoice</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            The invoice you’re looking for doesn’t exist or may have been removed.
            Try checking the link or go back to Sales.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to={orgPath(id, "invoices")}>
            <Button variant="outline">
              <ChevronLeft />
              Back to Sales
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
