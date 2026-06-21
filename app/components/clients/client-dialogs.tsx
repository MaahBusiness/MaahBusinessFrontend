import { type ReactNode, useState } from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { InvoiceReceiptDialog } from "@/components/sales/invoice-receipt-dialog";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useCloseOnActionSuccess } from "@/hooks/use-close-on-action-success";
import { useOrganisation } from "@/hooks/use-organisation";
import { Pencil, Plus, Receipt, ShoppingBag, UserPlus } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";
import type { Client, ServerActionState } from "types";
import { CUSTOMER_TYPES } from "types/consts";
import { capitalizeFirstChar, formatDisplayAmount } from "utils";
import { cn } from "@/lib/utils";

function normalizeCustomerType(type?: string) {
  return (type?.toLowerCase() ?? "regular") as (typeof CUSTOMER_TYPES)[number];
}

function ClientFormFields({ client }: { client?: Client }) {
  const [type, setType] = useState(normalizeCustomerType(client?.customer_type));

  return (
    <div className="flex flex-col gap-6 p-6 py-4">
      <input type="hidden" name="type" value={type} />
      <Field className="gap-4">
        <Label htmlFor="type">Client type</Label>
        <Select
          value={type}
          onValueChange={(value) =>
            setType(value as (typeof CUSTOMER_TYPES)[number])
          }
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select the type of client" />
          </SelectTrigger>
          <SelectContent>
            {CUSTOMER_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {capitalizeFirstChar(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          type="text"
          name="name"
          placeholder="Beff Jezos"
          required
          defaultValue={client?.name}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email address (optional)</FieldLabel>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="member@acme.com"
          defaultValue={client?.email}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
        <Input
          id="address"
          type="text"
          name="address"
          placeholder="123 Market Street, San Francisco, CA"
          defaultValue={client?.address}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
        <Input
          id="phone"
          type="tel"
          name="phone"
          defaultValue={client?.phone_number}
          placeholder="+1 555 123 4596"
        />
      </Field>
    </div>
  );
}

type AddClientDialogProps = {
  triggerClassName?: string;
};

export function AddClientDialog({ triggerClassName }: AddClientDialogProps) {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "add-client";

  useCloseOnActionSuccess(open, () => setOpen(false), "add-client");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger disabled={isAdding} asChild>
        <Button
          size="sm"
          className={cn("h-8 gap-1.5 px-2 text-xs lg:px-3", triggerClassName)}
        >
          {isAdding ? <Spinner className="size-4" /> : <Plus className="size-4" />}
          Add client
        </Button>
      </DialogTrigger>

      <DialogContent className="mx-4 w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:mx-auto sm:max-w-sm">
        <Form method="POST" key={open ? "add-client-open" : "add-client-closed"}>
          <input type="hidden" name="intent" value="add-client" />

          <DialogHeader className="border-b border-emerald-500/20 bg-emerald-500/5 p-6 py-4">
            <div className="mb-1 flex items-center gap-2 text-emerald-600">
              <UserPlus className="size-4" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Customer
              </span>
            </div>
            <DialogTitle className="text-base">Add new client</DialogTitle>
            <DialogDescription>
              Create a customer record for invoices and credit tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <ClientFormFields />
          </div>

          <DialogFooter className="border-t border-border p-6 py-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={isAdding}>
              {isAdding && <Spinner className="size-4" />}
              Add client
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditClientDialog({
  client,
  open,
  onOpenChange,
}: {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const actionData = useActionData<ServerActionState & { data?: Client }>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isUpdating = isSubmitting && intent === "update-client";

  useCloseOnActionSuccess(open, () => onOpenChange(false), "update-client");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 flex max-h-[90vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:mx-auto sm:max-w-lg">
        <Form
          method="POST"
          className="flex max-h-[90vh] flex-col"
          key={open ? `edit-${client.id}` : "edit-closed"}
        >
          <input type="hidden" name="intent" value="update-client" />
          <input type="hidden" name="id" value={client.id} />

          <DialogHeader className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent px-6 py-5">
            <div className="flex items-center gap-2 text-emerald-600">
              <Pencil className="size-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Edit client
              </span>
            </div>
            <DialogTitle className="truncate text-lg">{client.name}</DialogTitle>
            <DialogDescription>
              Update contact details or customer type.
            </DialogDescription>
          </DialogHeader>

          <div className="no-scrollbar relative flex-1 overflow-y-auto bg-muted/10">
            {actionData?.message && !actionData.success && (
              <p className="px-6 pt-4 text-sm text-destructive">
                {actionData.message}
              </p>
            )}
            <ClientFormFields client={client} />
          </div>

          <DialogFooter className="border-t border-border bg-background/95 px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isUpdating} className="auth-submit-btn border-0">
              {isUpdating && <Spinner className="size-4" />}
              Save changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use EditClientDialog */
export const EditClientDrawer = EditClientDialog;

type ClientDetailsDialogProps = {
  client: Client;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

function formatDateTime(value?: string) {
  if (!value) return "--";

  return new Date(value).toLocaleString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string) {
  if (!value) return "--";

  return new Date(value).toLocaleDateString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ClientDetailsSkeleton() {
  return (
    <div className="min-h-[28rem] space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-28 rounded-xl sm:col-span-2" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ClientDetailsDialog({
  client,
  open: openProp,
  onOpenChange,
  trigger,
}: ClientDetailsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { fetchSingleClient } = useOrganisation();
  const { data: detailRes, isLoading } = fetchSingleClient(client.id, {
    enabled: open,
  });

  const detail = detailRes?.success ? detailRes.data : undefined;
  const customerType = capitalizeFirstChar(
    normalizeCustomerType(detail?.customer_type ?? client.customer_type),
  );
  const totalSpent = Number(detail?.total_purchases ?? client.total_purchases ?? 0);
  const purchaseHistory = detail?.purchase_history ?? [];
  const productsBought = detail?.products_bought ?? [];
  const hasPurchases = purchaseHistory.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

        <DialogContent className="mx-4 flex max-h-[90vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:mx-auto sm:max-w-2xl">
          <DialogHeader className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent px-6 py-5">
            <div className="flex items-start gap-3">
              <Avatar className="mt-0.5 size-11">
                <BoringFallback name={client.name} />
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    Customer details
                  </Badge>
                  <Badge variant="secondary">{customerType}</Badge>
                </div>
                <DialogTitle className="truncate text-lg">{client.name}</DialogTitle>
                <DialogDescription className="truncate">
                  Profile, contact details, and purchase analytics.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="no-scrollbar flex-1 overflow-y-auto bg-muted/10 px-6 py-5">
            {isLoading && !detailRes ? (
              <ClientDetailsSkeleton />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Item variant="outline" className="rounded-xl border-emerald-500/20 bg-emerald-500/5 sm:col-span-2">
                    <ItemContent className="gap-2">
                      <ItemDescription>Lifetime total spent</ItemDescription>
                      <ItemTitle className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatDisplayAmount(totalSpent)}
                      </ItemTitle>
                      <p className="text-xs text-muted-foreground">
                        {hasPurchases
                          ? `${purchaseHistory.length} invoice${purchaseHistory.length === 1 ? "" : "s"} on record`
                          : "No purchases recorded yet"}
                      </p>
                    </ItemContent>
                  </Item>

                  <Item variant="outline" className="rounded-xl">
                    <ItemContent className="gap-2">
                      <ItemDescription>Loyalty points</ItemDescription>
                      <ItemTitle className="text-base">
                        {detail?.loyalty_points ?? client.loyalty_points ?? "0"}
                      </ItemTitle>
                    </ItemContent>
                  </Item>

                  <Item variant="outline" className="rounded-xl">
                    <ItemContent className="gap-2">
                      <ItemDescription>Products purchased</ItemDescription>
                      <ItemTitle className="text-base">
                        {productsBought.length}
                      </ItemTitle>
                    </ItemContent>
                  </Item>
                </div>

                <section className="mt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="size-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold">Purchase history</h3>
                  </div>

                  {!hasPurchases ? (
                    <Empty className="border border-dashed">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Receipt />
                        </EmptyMedia>
                        <EmptyTitle>No purchases yet</EmptyTitle>
                        <EmptyDescription>
                          Invoices linked to this customer will appear here.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Invoice</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchaseHistory.map((purchase) => (
                            <TableRow key={purchase.invoice_id}>
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {formatDate(purchase.purchase_date)}
                              </TableCell>
                              <TableCell>
                                <button
                                  type="button"
                                  className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                                  onClick={() => {
                                    setSelectedInvoiceId(purchase.invoice_id);
                                    setInvoiceOpen(true);
                                  }}
                                >
                                  #{purchase.invoice_number}
                                </button>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatDisplayAmount(Number(purchase.total_amount))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </section>

                <section className="mt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold">Products bought</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sorted by how often this customer buys each product.
                  </p>

                  {productsBought.length === 0 ? (
                    <Empty className="border border-dashed">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ShoppingBag />
                        </EmptyMedia>
                        <EmptyTitle>No product history</EmptyTitle>
                        <EmptyDescription>
                          Product breakdown appears after the first sale.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Times</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Spent</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productsBought.map((product) => (
                            <TableRow key={product.product_id}>
                              <TableCell className="max-w-[140px] truncate font-medium sm:max-w-none">
                                {product.product_name}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {product.purchase_count}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {product.total_qty}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatDisplayAmount(Number(product.total_spent))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </section>

                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold">Contact</h3>

                  <Item variant="outline" className="rounded-xl">
                    <ItemContent>
                      <ItemDescription>Email</ItemDescription>
                      <ItemTitle>{(detail?.email ?? client.email) || "--"}</ItemTitle>
                    </ItemContent>
                  </Item>

                  <Item variant="outline" className="rounded-xl">
                    <ItemContent>
                      <ItemDescription>Phone</ItemDescription>
                      <ItemTitle>{(detail?.phone_number ?? client.phone_number) || "--"}</ItemTitle>
                    </ItemContent>
                  </Item>

                  <Item variant="outline" className="rounded-xl">
                    <ItemContent>
                      <ItemDescription>Address</ItemDescription>
                      <ItemTitle className="w-full whitespace-normal">
                        {(detail?.address ?? client.address) || "--"}
                      </ItemTitle>
                    </ItemContent>
                  </Item>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Item variant="outline" className="rounded-xl">
                      <ItemContent>
                        <ItemDescription>Created</ItemDescription>
                        <ItemTitle className="w-full whitespace-normal">
                          {formatDateTime(detail?.created_at ?? client.created_at)}
                        </ItemTitle>
                      </ItemContent>
                    </Item>

                    <Item variant="outline" className="rounded-xl">
                      <ItemContent>
                        <ItemDescription>Last updated</ItemDescription>
                        <ItemTitle className="w-full whitespace-normal">
                          {formatDateTime(detail?.updated_at ?? client.updated_at)}
                        </ItemTitle>
                      </ItemContent>
                    </Item>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="border-t border-border bg-background/95 px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InvoiceReceiptDialog
        invoiceId={selectedInvoiceId ?? ""}
        open={invoiceOpen && !!selectedInvoiceId}
        stacked
        onOpenChange={(nextOpen) => {
          setInvoiceOpen(nextOpen);
          if (!nextOpen) setSelectedInvoiceId(null);
        }}
      />
    </>
  );
}

/** @deprecated Use ClientDetailsDialog */
export const ClientDetailsDrawer = ClientDetailsDialog;
