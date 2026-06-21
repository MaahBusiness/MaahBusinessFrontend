import { type ReactNode, useEffect, useState } from "react";
import {
  SingleArchivedActions,
  SingleInvoiceActions,
} from "@/components/sales/single-invoice-actions";
import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys } from "@/lib/api/organisation";
import { orgPath } from "@/lib/org-navigation";
import { cn } from "@/lib/utils";
import { methods, statuses } from "@/routes/dashboard/sales/data";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  CircleDashed,
  CircleSlash,
  RefreshCcwIcon,
} from "lucide-react";
import { Link, useActionData, useParams } from "react-router";
import { toast } from "sonner";
import type { Invoice, ServerActionState } from "types";
import { formatDisplayAmount, genericErrorState, percent } from "utils";

export function formatReceiptDate(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en", options);
}

export function formatReceiptDateTime(value: string) {
  return formatReceiptDate(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isValidDueDate(dueDate?: string | null) {
  if (!dueDate) return false;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() > 1970;
}

const receiptDialogClassName =
  "mx-4 flex max-h-[90vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:mx-auto sm:max-w-2xl";

type InvoiceReceiptContentProps = {
  data: Invoice;
  orgName?: string;
  className?: string;
};

export function InvoiceReceiptContent({
  data,
  orgName,
  className,
}: InvoiceReceiptContentProps) {
  const invoiceDate = formatReceiptDate(data.created_at);
  const dueDate = isValidDueDate(data.due_date)
    ? formatReceiptDate(data.due_date!)
    : null;
  const status = statuses.find((s) => s.value === data.status);
  const paymentMethod = methods.find(
    (method) => method.value.toLowerCase() === data.payment_method,
  );

  const { subtotal } = data.lines.reduce(
    (acc, l) => {
      acc.subtotal += l.quantity * l.unit_price;
      return acc;
    },
    { subtotal: 0 },
  );

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Invoice detail
        </p>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {data.is_archived ? (
            <SingleArchivedActions data={data} />
          ) : (
            <SingleInvoiceActions data={data} />
          )}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <header className="border-b border-dashed border-border/60 px-4 py-6 text-center sm:px-6">
          {orgName ? (
            <p className="text-sm font-semibold tracking-wide">{orgName}</p>
          ) : null}
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Receipt</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Invoice #{data.number}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge
              variant="outline"
              className={cn("gap-1 capitalize", status?.badgeClassName)}
            >
              {status?.icon && <status.icon className="size-3.5" />}
              {status?.label ?? data.status}
            </Badge>
            {invoiceDate ? (
              <span className="text-sm text-muted-foreground">{invoiceDate}</span>
            ) : null}
          </div>
        </header>

        <section className="grid gap-4 border-b border-border/60 px-4 py-4 text-sm sm:grid-cols-2 sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Bill to
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Avatar className="size-6">
                <BoringFallback name={data.customer_name} />
              </Avatar>
              <span className="font-medium">
                {data.customer_name ?? "Walk-in customer"}
              </span>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Details
            </p>
            <dl className="mt-1.5 space-y-1">
              <div className="flex items-center justify-end gap-2">
                <dt className="text-muted-foreground">Served by</dt>
                <dd className="flex items-center gap-1.5 font-medium">
                  {data.cashier_name ?? "—"}
                  {data.cashier_name ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="size-5">
                          <BoringFallback name={data.cashier_name} />
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>By {data.cashier_name}</TooltipContent>
                    </Tooltip>
                  ) : null}
                </dd>
              </div>
              {paymentMethod ? (
                <div className="flex items-center justify-end gap-2">
                  <dt className="text-muted-foreground">Payment</dt>
                  <dd className="flex items-center gap-1 font-medium">
                    {paymentMethod.icon ? (
                      <paymentMethod.icon className="size-3.5 text-muted-foreground" />
                    ) : null}
                    {paymentMethod.label}
                  </dd>
                </div>
              ) : null}
              {dueDate ? (
                <div className="flex items-center justify-end gap-2">
                  <dt className="text-muted-foreground">Due date</dt>
                  <dd className="font-medium">{dueDate}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>

        <section className="px-2 py-4 sm:px-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 px-2 text-xs">Product</TableHead>
                  <TableHead className="h-8 w-12 px-2 text-right text-xs">
                    Qty
                  </TableHead>
                  <TableHead className="hidden h-8 px-2 text-right text-xs sm:table-cell">
                    Unit price
                  </TableHead>
                  <TableHead className="hidden h-8 w-16 px-2 text-right text-xs md:table-cell">
                    Disc
                  </TableHead>
                  <TableHead className="h-8 w-24 px-2 text-right text-xs">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lines.map((line) => {
                  const lineTotal = line.quantity * line.unit_price;
                  return (
                    <TableRow key={line.id} className="hover:bg-muted/40">
                      <TableCell className="max-w-[140px] truncate px-2 py-2.5 text-sm font-medium sm:max-w-[200px]">
                        <div>{line.product_name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                          {line.quantity} × {formatDisplayAmount(line.unit_price)}
                          {line.discount > 0
                            ? ` · −${formatDisplayAmount(line.discount)}`
                            : ""}
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-2.5 text-right text-sm tabular-nums">
                        {line.quantity}
                      </TableCell>
                      <TableCell className="hidden px-2 py-2.5 text-right text-sm tabular-nums sm:table-cell">
                        {formatDisplayAmount(line.unit_price)}
                      </TableCell>
                      <TableCell
                        className="hidden px-2 py-2.5 text-right text-sm tabular-nums md:table-cell"
                        title={`${percent(line.discount, lineTotal, 2)}%`}
                      >
                        {line.discount > 0
                          ? `−${formatDisplayAmount(line.discount)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="px-2 py-2.5 text-right text-sm font-medium tabular-nums">
                        {formatDisplayAmount(lineTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!data.lines.length && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="h-24 px-2 text-center text-sm text-muted-foreground"
                    >
                      No products on this invoice.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="border-t border-dashed border-border/60 px-4 py-4 sm:px-6">
          <dl className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatDisplayAmount(subtotal)}</dd>
            </div>
            {data.total_discount > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="tabular-nums text-emerald-600 dark:text-emerald-400">
                  − {formatDisplayAmount(data.total_discount)}
                </dd>
              </div>
            ) : null}
            {data.tax > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Tax</dt>
                <dd className="tabular-nums">+ {formatDisplayAmount(data.tax)}</dd>
              </div>
            ) : null}
            <Separator className="my-2" />
            <div className="flex items-center justify-between gap-4 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatDisplayAmount(data.total)}</dd>
            </div>
            {data.advance_paid > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Paid</dt>
                <dd className="tabular-nums">
                  {formatDisplayAmount(data.advance_paid)}
                </dd>
              </div>
            ) : null}
            {data.remaining_amount > 0 ? (
              <div className="flex items-center justify-between gap-4 font-medium text-amber-700 dark:text-amber-400">
                <dt>Balance due</dt>
                <dd className="tabular-nums">
                  {formatDisplayAmount(data.remaining_amount)}
                </dd>
              </div>
            ) : null}
            {data.refund_amount > 0 ? (
              <div className="flex items-center justify-between gap-4 font-medium text-violet-700 dark:text-violet-400">
                <dt>To be refunded</dt>
                <dd className="tabular-nums">
                  {formatDisplayAmount(data.refund_amount)}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <InvoiceReceiptPayments invoice={data} />

        <footer className="border-t border-border/60 bg-muted/10 px-4 py-3 text-center text-[11px] leading-relaxed text-muted-foreground sm:px-6">
          {formatReceiptDateTime(data.created_at) ? (
            <span>Created {formatReceiptDateTime(data.created_at)}</span>
          ) : null}
          {formatReceiptDateTime(data.updated_at) ? (
            <>
              <span className="mx-1.5 hidden sm:inline">·</span>
              <span className="block sm:inline">
                Updated {formatReceiptDateTime(data.updated_at)}
              </span>
            </>
          ) : null}
          <span className="mx-1.5 hidden sm:inline">·</span>
          <span className="block sm:inline">Ref. {data.id}</span>
        </footer>
      </div>
    </article>
  );
}

function InvoiceReceiptPayments({ invoice }: { invoice: Invoice }) {
  const { fetchInvoicePayments } = useOrganisation();
  const { data: res, isFetching, refetch } = fetchInvoicePayments(invoice.id);

  if (isFetching) {
    return (
      <div className="border-t border-border/60 px-4 py-4 sm:px-6">
        <Skeleton className="mb-3 h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!res?.success) {
    return (
      <div className="border-t border-border/60 px-4 py-4 sm:px-6">
        <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Payments
        </h4>
        <Empty className="min-h-32 border border-dashed">
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
            <Button onClick={() => refetch()}>
              <RefreshCcwIcon />
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  if (!res.data?.length) {
    return (
      <div className="border-t border-border/60 px-4 py-4 sm:px-6">
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Payments
        </h4>
        <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
      </div>
    );
  }

  return (
    <section className="border-t border-border/60 px-2 py-4 sm:px-4">
      <h4 className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-0">
        Payment history
      </h4>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 px-2 text-xs">Amount</TableHead>
              <TableHead className="h-8 px-2 text-xs">Method</TableHead>
              <TableHead className="hidden h-8 px-2 text-xs sm:table-cell">
                Date
              </TableHead>
              <TableHead className="hidden h-8 px-2 text-xs md:table-cell">
                Notes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {res.data.map((p) => {
              const method = methods.find(
                (m) => m.value.toLowerCase() === p.payment_method,
              );
              return (
                <TableRow key={p.id} className="hover:bg-muted/40">
                  <TableCell className="px-2 py-2.5 text-sm font-medium tabular-nums">
                    {formatDisplayAmount(p.amount)}
                    <div className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                      {method?.label ?? p.payment_method}
                      {" · "}
                      {formatReceiptDate(p.payment_date) ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      {method?.icon ? (
                        <method.icon className="size-3.5 text-muted-foreground" />
                      ) : null}
                      <span>{method?.label ?? p.payment_method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden px-2 py-2.5 text-sm sm:table-cell">
                    <div className="flex items-center gap-2">
                      {formatReceiptDate(p.payment_date) ?? "—"}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="size-5">
                            <BoringFallback name={p.created_by_name} />
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>By {p.created_by_name}</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[120px] truncate px-2 py-2.5 text-sm text-muted-foreground md:table-cell">
                    {p.notes || "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function InvoiceReceiptSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <Skeleton className="h-12 w-full rounded-none" />
      <div className="space-y-4 px-6 py-8">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-32" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="ml-auto h-28 w-full max-w-xs" />
      </div>
    </div>
  );
}

type InvoiceReceiptDialogProps = {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
};

export function InvoiceReceiptDialog({
  invoiceId,
  open,
  onOpenChange,
  trigger,
}: InvoiceReceiptDialogProps) {
  const { id: orgId } = useParams();
  const { fetchSingleInvoice, organisation } = useOrganisation();
  const actionData = useActionData<ServerActionState & { data?: Invoice }>();
  const queryClient = useQueryClient();
  const { data: res, isFetching, error, refetch } = fetchSingleInvoice(invoiceId, {
    enabled: open,
  });

  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success && orgId && res?.data) {
      queryClient.invalidateQueries({
        queryKey: organisationKeys.invoiceList(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: organisationKeys.invoice(res.data.id),
      });
      queryClient.invalidateQueries({
        queryKey: organisationKeys.paymentList(orgId, { invoice: res.data.id }),
      });
    }
  }, [actionData, orgId, res?.data, queryClient]);

  const orgName = organisation?.data?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={receiptDialogClassName}>
        {isFetching ? (
          <InvoiceReceiptSkeleton />
        ) : !res?.success || error ? (
          <div className="p-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleSlash />
                </EmptyMedia>
                <EmptyTitle>Could not load invoice</EmptyTitle>
                <EmptyDescription>
                  {res?.message ?? genericErrorState().message}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => refetch()}>
                  <RefreshCcwIcon />
                  Try again
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : !res.data ? (
          <div className="p-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleDashed />
                </EmptyMedia>
                <EmptyTitle>Invoice not found</EmptyTitle>
                <EmptyDescription>
                  This invoice may have been removed or you do not have access.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <InvoiceReceiptContent data={res.data} orgName={orgName} />
        )}
      </DialogContent>
    </Dialog>
  );
}

type InvoiceDetailTriggerProps = {
  invoiceId: string;
  children: ReactNode;
  className?: string;
  asChild?: boolean;
};

export function InvoiceDetailTrigger({
  invoiceId,
  children,
  className,
}: InvoiceDetailTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "cursor-pointer border-0 bg-transparent p-0 text-left font-inherit text-inherit",
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </button>
      <InvoiceReceiptDialog
        invoiceId={invoiceId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function InvoiceReceiptModalPage({
  data,
  orgName,
}: {
  data: Invoice;
  orgName?: string;
}) {
  const { id: orgId } = useParams();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={cn(
          receiptDialogClassName,
          "relative rounded-lg border border-border bg-background shadow-2xl",
        )}
      >
        <div className="absolute top-3 left-3 z-10">
          <Button variant="outline" size="sm" asChild className="h-8 bg-background/90 backdrop-blur-sm">
            <Link to={orgPath(orgId, "invoices")}>
              <ChevronLeft className="size-4" />
              Back to Sales
            </Link>
          </Button>
        </div>
        <InvoiceReceiptContent data={data} orgName={orgName} className="border-0 shadow-none" />
      </div>
    </div>
  );
}