import type { Route } from ".react-router/types/app/routes/dashboard/sales/+types/single-invoice";
import {
  SingleArchivedActions,
  SingleInvoiceActions,
} from "@/components/sales/single-invoice-actions";
import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  Table,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { methods, statuses } from "@/routes/dashboard/sales/data";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  CircleSlash,
  RefreshCcwIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, redirect, useNavigation, useParams } from "react-router";
import { handleSalesActions } from "services/api";
import { toast } from "sonner";
import type { Invoice, ServerActionState } from "types";
import { formatDisplayAmount, genericErrorState, percent } from "utils";

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
  const { fetchSingleInvoice } = useOrganisation();

  if (!invId) return <RequestFailed />;

  const intent = navigation.formData?.get("intent");

  const { data: res, isFetching, error, refetch } = fetchSingleInvoice(invId);

  // const data = mockInvoices[0];
  // const payments = mockPayments;
  const status = useMemo(
    () => statuses.find((status) => status.value === res?.data?.status),
    [res?.data],
  );

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id && res?.data) {
        // Automatically refetch products
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

  if (isFetching) return <SingleSkeleton />;
  if (!res?.success) return <RequestFailed refetch={refetch} />;
  if (!res.data) return <InvoiceNotFound />;

  const { data } = res;

  const { subtotal } = data.lines.reduce(
    (acc, l) => {
      const lineTotal = l.quantity * l.unit_price;
      acc.subtotal += lineTotal;
      return acc;
    },
    { subtotal: 0 },
  );

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex flex-col md:flex-row md:items-center gap-4 md:gap-2">
        <div className="w-full flex items-center gap-2">
          <Link to="../invoices">
            <h2 className="text-lg tracking-tight text-muted-foreground">
              Invoices
            </h2>
          </Link>
          <ChevronRight className="text-muted-foreground size-4" />
          <h2 className="text-lg tracking-tight">#{data.number}</h2>
        </div>

        <div className="md:ml-auto flex  md:items-center md:justify-end">
          {data.is_archived ? (
            <SingleArchivedActions data={data} />
          ) : (
            <SingleInvoiceActions data={data} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl tracking-tight font-medium">
          Invoice #{data.number}
        </h1>
        <h5 className="text-muted-foreground">ID: {data.id}</h5>
      </div>

      <Separator className="h-px" />

      {/* Meta */}
      <div className="grid auto-rows-min gap-6 grid-cols-2  md:grid-cols-4">
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Total Amount</ItemDescription>
            <ItemTitle className="text-base font-medium">
              {formatDisplayAmount(`${data.total}`)}
            </ItemTitle>
          </ItemContent>
        </Item>

        {data.refund_amount ? (
          <Item className="p-0">
            <ItemContent className="gap-3">
              <ItemDescription>To Be Refunded</ItemDescription>
              <ItemTitle className="text-base font-medium">
                {formatDisplayAmount(`${data.refund_amount}`)}
              </ItemTitle>
            </ItemContent>
          </Item>
        ) : (
          <></>
        )}
        {data.remaining_amount ? (
          <>
            <Item className="p-0">
              <ItemContent className="gap-3">
                <ItemDescription>Total Due</ItemDescription>
                <ItemTitle className="text-base font-medium">
                  {formatDisplayAmount(`${data.remaining_amount}`)}
                </ItemTitle>
              </ItemContent>
            </Item>
            <Item className="p-0">
              <ItemContent className="gap-3">
                <ItemDescription>Due Date</ItemDescription>
                <ItemTitle className="text-base font-medium ">
                  {new Date(data.due_date!).toLocaleDateString("en", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </ItemTitle>
              </ItemContent>
            </Item>
          </>
        ) : (
          <></>
        )}
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Invoice Number</ItemDescription>
            <ItemTitle className="text-base font-medium">
              #{data.number}
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>For</ItemDescription>
            <ItemTitle className="text-base font-medium gap-2">
              <Avatar className="size-5">
                {/* <AvatarImage src={val} /> */}
                <BoringFallback name={data.customer_name} />
              </Avatar>

              {data.customer_name}
            </ItemTitle>
          </ItemContent>
        </Item>

        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Status</ItemDescription>
            <ItemTitle className="text-base font-medium gap-1">
              {status?.icon && (
                <status.icon className="mr-1 h-4 w-4 text-muted-foreground" />
              )}
              <span className={status?.className}>{status?.label}</span>
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Date invoiced</ItemDescription>
            <ItemTitle className="text-base font-medium gap-2 items-center">
              {new Date(data.created_at).toLocaleDateString("en", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="size-5">
                    {/* <AvatarImage src={val} /> */}
                    <BoringFallback name={data.cashier_name} />
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>By {data.cashier_name}</TooltipContent>
              </Tooltip>
            </ItemTitle>
          </ItemContent>
        </Item>
      </div>

      <Separator className="h-px" />

      {/* Dual Cols */}
      <div className="justify-between flex flex-col laptop:flex-row w-full overflow-hidden gap-8 laptop:gap-20 ">
        {/* Right Col */}
        <div className="flex items-stretch flex-initial flex-col gap-20 w-full">
          <div className="flex flex-col gap-8">
            {/* <h4 className="scroll-m-20 text-lg tracking-tight">General</h4> */}

            {/* <div className="overflow-hidden rounded-md border"> */}
            <div className="overflow-hidden ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium max-w-[150px] truncate py-4">
                        {line.product_name}
                      </TableCell>
                      <TableCell>{line.quantity}</TableCell>
                      <TableCell>
                        {formatDisplayAmount(line.unit_price)}
                      </TableCell>
                      <TableCell
                        title={`${percent(line.discount, line.unit_price * line.quantity, 2)}%`}
                      >
                        {formatDisplayAmount(line.discount)}
                      </TableCell>

                      <TableCell className="text-right">
                        {formatDisplayAmount(line.unit_price * line.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data.lines.length && (
                    <TableRow className="hover:bg-muted">
                      <TableCell colSpan={5} className="h-32 text-center">
                        No products added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter className="bg-transparent text-muted-foreground">
                  <TableRow className="border-b">
                    <TableCell colSpan={3}>Subtotal</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      {formatDisplayAmount(subtotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b">
                    <TableCell colSpan={3}>Discounts</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      - {formatDisplayAmount(data.total_discount)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3}>Tax</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      + {formatDisplayAmount(data.tax)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      {formatDisplayAmount(data.total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              <Separator orientation="horizontal" />
            </div>
          </div>

          <Payments invoice={data} />
        </div>

        {/* Left side  */}
        <div className=" laptop:max-w-80  w-full shrink-0  sticky  self-start">
          <div className="flex flex-col gap-4">
            {/* <h4 className="scroll-m-20 text-lg tracking-tight">Timeline</h4> */}

            <div className="flex flex-col px-0">
              {data.due_date && (
                <div className="flex gap-4 p-4 border-b ">
                  <div className="flex flex-col flex-1 gap-1">
                    <h5 className="scroll-m-20 tracking-tight">Due on</h5>
                  </div>

                  <span className="text-right">
                    {new Date(data.due_date).toLocaleDateString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

              <div className="flex gap-4 p-4 border-b ">
                <div className="flex flex-col flex-1 gap-1">
                  <h5 className="scroll-m-20 tracking-tight">Last updated</h5>
                </div>

                <span className="text-right">
                  {new Date(data.updated_at).toLocaleDateString("en", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex gap-4 p-4 ">
                <div className="flex flex-col flex-1 gap-1">
                  <h5 className="scroll-m-20 tracking-tight">Created</h5>
                </div>

                <span className="text-right">
                  {new Date(data.created_at).toLocaleDateString("en", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Payments({ invoice }: { invoice: Invoice }) {
  const { fetchInvoicePayments } = useOrganisation();

  const { data: res, isFetching, refetch } = fetchInvoicePayments(invoice.id);

  if (isFetching)
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-40" />
      </div>
    );
  if (!res?.success)
    return (
      <div className="flex flex-col gap-4">
        <h4 className="scroll-m-20 text-lg tracking-tight">Payments</h4>
        <Empty className="border border-dashed min-h-40">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleSlash />
            </EmptyMedia>
            <EmptyTitle>Something went wrong</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
              {genericErrorState().message}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={
                () => refetch() // hard refresh current route
              }
            >
              <RefreshCcwIcon />
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  if (!res.data)
    return (
      <div className="flex flex-col gap-4">
        <h4 className="scroll-m-20 text-lg tracking-tight">Payments</h4>
        <Empty className="border border-dashed min-h-40">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleSlash />
            </EmptyMedia>
            <EmptyTitle>No payments found</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
              We couldn't find any payments for this invoice. You can register a
              payment from the actions above.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );

  const { data } = res;

  return (
    <div className="flex flex-col gap-4">
      <h4 className="scroll-m-20 text-lg tracking-tight">Payments</h4>

      {/* <div className="overflow-hidden rounded-md border"> */}
      <div className="overflow-hidden ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>To Be Refunded</TableHead>
              <TableHead>Notes</TableHead>
              {/* <TableHead>Processed By</TableHead> */}
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p) => {
              const method = methods.find(
                (method) => method.value.toLowerCase() === p.payment_method,
              );
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium max-w-[150px] truncate py-4">
                    {formatDisplayAmount(p.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {method?.icon && (
                        <method.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{method?.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.change_amount > 0 ? (
                      formatDisplayAmount(p.change_amount)
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.refund_amount > 0 ? (
                      formatDisplayAmount(p.refund_amount)
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-25 truncate" title={p.notes}>
                      <span className="truncate">{p.notes}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(p.payment_date).toLocaleDateString("en", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="size-5">
                            {/* <AvatarImage src={val} /> */}
                            <BoringFallback name={p.created_by_name} />
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>By {p.created_by_name}</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter className="bg-transparent text-muted-foreground">
            <TableRow className="border-b">
              <TableCell colSpan={5}>Total Paid</TableCell>
              <TableCell className="text-right" colSpan={1}>
                {formatDisplayAmount(invoice.advance_paid)}
              </TableCell>
            </TableRow>
            {invoice.remaining_amount ? (
              <TableRow>
                <TableCell colSpan={5}>Amount Due</TableCell>
                <TableCell className="text-right" colSpan={2}>
                  {formatDisplayAmount(invoice.remaining_amount)}
                </TableCell>
              </TableRow>
            ) : (
              <></>
            )}
            {invoice.refund_amount ? (
              <TableRow>
                <TableCell colSpan={5}>To Be Refunded</TableCell>
                <TableCell className="text-right" colSpan={2}>
                  {formatDisplayAmount(invoice.refund_amount)}
                </TableCell>
              </TableRow>
            ) : (
              <></>
            )}
          </TableFooter>
        </Table>
        <Separator orientation="horizontal" />
      </div>
    </div>
  );
}

function SingleSkeleton() {
  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <ChevronRight className="text-muted-foreground size-4" />
        <Skeleton className="h-5 w-16" />

        <div className="ml-auto flex items-center justify-end gap-2">
          <Button>
            <Skeleton className="h-2 w-8" />
          </Button>
          <Button variant={"outline"}>
            <Skeleton className="h-2 w-8" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-14" />
      </div>

      <Separator className="h-px" />

      {/* Meta */}
      <div className="grid auto-rows-min gap-6 grid-cols-2  md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, id) => (
          <div className="flex flex-col gap-4">
            <Skeleton key={id} className="h-18" />
          </div>
        ))}
      </div>

      <Separator className="h-px" />

      {/* Dual Cols */}
      <div className="justify-between flex flex-col md:flex-row w-full gap-20 ">
        {/* Right Col */}
        <div className="flex items-stretch flex-initial flex-col gap-20 w-full">
          {Array.from({ length: 2 }).map((_) => (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-40" />
            </div>
          ))}
        </div>

        {/* Right side  */}
        <div className=" max-w-80 w-full  sticky top-4 self-start gap-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceNotFound() {
  return (
    <Empty className="p-0 !h-[calc(100svh-var(--header-height))]">
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
        <Link to="../invoices">
          <Button variant="outline">
            <ChevronLeft />
            Back to Sales
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
