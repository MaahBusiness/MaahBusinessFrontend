import ClientSelector from "@/components/sales/client-selector";
import { PickerDropdown } from "@/components/sales/picker-dropdown";
import { PosProductPicker } from "@/components/sales/pos-product-search-dialog";
import { ProductFormSection } from "@/components/products/product-form-section";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganisation } from "@/hooks/use-organisation";
import { useIsMobile } from "@/hooks/use-mobile";
import { paymentMethodsAtCheckout } from "@/routes/dashboard/sales/data";
import {
  AlertCircle,
  Barcode,
  CalendarIcon,
  CreditCard,
  FileClock,
  Plus,
  Receipt,
  ScanBarcode,
  Trash2,
  UserRound,
} from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { AddedLine, Product, ServerActionState } from "types";
import { formatDisplayAmount, genericErrorState, percent } from "utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function parseAmount(raw: string | undefined): number {
  return parseInt(`${raw ?? ""}`.replace(/\D/g, ""), 10) || 0;
}

export function CreateInvoiceDrawer({
  variant = "toolbar",
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  formAction,
}: {
  variant?: "toolbar" | "hero";
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  formAction?: string;
}) {
  const actionData = useActionData<ServerActionState & { data?: Product }>();
  const navigation = useNavigation();
  const { scanCode } = useOrganisation();
  const isMobile = useIsMobile();

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [advance, setAdvance] = useState("0");
  const [tax, setTax] = useState("0");
  const [onCredit, setOnCredit] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  const [dueCalendarOpen, setDueCalendarOpen] = useState(false);
  const [method, setMethod] = useState("cash");
  const [CFD, setCFD] = useState<{ code: string; qty: number }>();
  const [lines, setLines] = React.useState<AddedLine[]>([]);

  const errors = actionData?.errors;
  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "create-invoice";

  useEffect(() => {
    if (!actionData || navigation.state !== "idle") return;

    if (actionData.success) {
      setLines([]);
      setAdvance("0");
      setTax("0");
      setOnCredit(false);
      setDueDate(undefined);
      setDueCalendarOpen(false);
      setCFD(undefined);
      setMethod("cash");
      setOpen(false);
      return;
    }

    if (actionData.errors) {
      const messages = Object.values(actionData.errors).filter(Boolean);
      if (messages.length) toast.error(messages[0] as string);
    } else if (actionData.message) {
      toast.error(actionData.message);
    }
  }, [actionData, navigation.state, setOpen]);

  useEffect(() => {
    if (controlledOpen === undefined && defaultOpen) {
      setInternalOpen(true);
    }
  }, [controlledOpen, defaultOpen]);

  const { refetch, isFetching } = scanCode(CFD?.code ?? "");

  const { subtotal, totalDiscount } = lines.reduce(
    (acc, l) => {
      const lineTotal = l.qty * l.unit_price;
      const discount = l.qty * (l.discount || 0);
      acc.subtotal += lineTotal;
      acc.totalDiscount += discount;
      return acc;
    },
    { subtotal: 0, totalDiscount: 0 },
  );

  const totalAfterDiscount = subtotal - totalDiscount;
  const taxAmount = parseAmount(tax);
  const grandTotal = totalAfterDiscount + taxAmount;
  const paidAmount = parseAmount(advance);
  const balanceDue = Math.max(0, grandTotal - paidAmount);
  const changeDue = Math.max(0, paidAmount - grandTotal);
  const isPartialPayment = paidAmount > 0 && paidAmount < grandTotal && !onCredit;

  useEffect(() => {
    if (onCredit) setMethod("credit");
    else {
      setDueDate(undefined);
      setDueCalendarOpen(false);
    }
  }, [onCredit]);

  async function handleAdd() {
    if (!CFD) {
      toast.error("Enter a barcode and quantity.");
      return;
    }
    const { code, qty } = CFD;
    if (!code.trim()) {
      toast.error("Enter a valid barcode.");
      return;
    }
    if (qty < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    const { data, error } = await refetch();
    if (error) {
      toast.error(genericErrorState().message);
      return;
    }
    if (!data?.data) {
      toast.error(data?.message ?? "Product not found.");
      return;
    }

    addProductLine(data.data, qty);
    setCFD((prev) => ({ code: prev?.code ?? "", qty: 1 }));
  }

  function addProductLine(pr: Product, qty: number) {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === pr.id);
      if (existing) {
        return prev.map((l) =>
          l.id === pr.id
            ? { ...l, qty: Math.min(qty, pr.quantity) }
            : l,
        );
      }
      return [
        ...prev,
        {
          ...pr,
          qty: Math.min(qty, pr.quantity),
          discount: 0,
        },
      ];
    });
  }

  const updateQuantity = (id: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, qty: Math.max(1, Math.min(qty, l.quantity)) } : l,
      ),
    );
  };

  const updateLineDiscount = (id: string, raw: string) => {
    const perUnit = Math.max(0, Number(raw) || 0);
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const max = Number(l.unit_price) || 0;
        return { ...l, discount: Math.min(perUnit, max) };
      }),
    );
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={open}
        onOpenChange={setOpen}
        modal={false}
      >
        <DrawerTrigger asChild>
          <Button
            size={variant === "hero" ? "default" : "sm"}
            className={cn(
              variant === "hero"
                ? "auth-submit-btn h-10 gap-2 border-0 px-5 shadow-sm"
                : "h-8 px-2 text-xs lg:px-3",
            )}
          >
            {isAdding ? (
              <Spinner className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            New sale
          </Button>
        </DrawerTrigger>

        <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-3xl data-[vaul-drawer-direction=bottom]:max-h-[min(92vh,720px)] data-[vaul-drawer-direction=bottom]:rounded-t-xl">
          <Form
            method="POST"
            action={formAction}
            encType="multipart/form-data"
            className="flex h-full flex-col"
            onSubmit={(e) => {
              const invalid = lines.find((l) => {
                const lineSubtotal = l.qty * l.unit_price;
                const lineDiscount = l.qty * (l.discount || 0);
                return lineDiscount > lineSubtotal;
              });
              if (invalid) {
                e.preventDefault();
                toast.error(
                  `Discount for "${invalid.name}" cannot exceed the line subtotal.`,
                );
                return;
              }
              if (onCredit && !dueDate) {
                e.preventDefault();
                toast.error("Please select a due date for the credit sale.");
              }
            }}
          >
            <DrawerHeader className="border-b border-violet-500/15 bg-gradient-to-r from-violet-500/10 via-card to-blue-500/5 px-6 py-5">
              <DrawerTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Receipt className="size-5 text-violet-600" />
                New sale
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">
                Scan products, assign a customer, and record payment. Invoice
                status is calculated automatically.
              </p>
            </DrawerHeader>

            <div className="no-scrollbar relative flex-1 overflow-y-auto p-4 sm:p-6">
              <input type="hidden" name="intent" value="create-invoice" />
              <input type="hidden" name="lines" value={JSON.stringify(lines)} />
              {onCredit && (
                <input type="hidden" name="method" value="credit" />
              )}

              <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:gap-6">
                <div className="space-y-4">
                  <ProductFormSection
                    title="Customer"
                    description="Search and select a customer, or use walk-in."
                    icon={UserRound}
                    accent="violet"
                  >
                    <ClientSelector allowWalkIn />
                    <FieldError errors={[{ message: errors?.client }]} />
                  </ProductFormSection>

                  <ProductFormSection
                    title="Line items"
                    description="Scan, browse the catalog, then set quantity and discount per line."
                    icon={Barcode}
                    accent="blue"
                  >
                    <div className="flex flex-wrap items-end gap-2">
                      <Field className="min-w-[180px] flex-1">
                        <FieldLabel htmlFor="code" className="sr-only">
                          Barcode
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            ref={barcodeRef}
                            id="code"
                            name="code"
                            type="text"
                            value={CFD?.code ?? ""}
                            onChange={(e) =>
                              setCFD((p) => ({
                                code: e.target.value,
                                qty: p?.qty ?? 1,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleAdd();
                              }
                            }}
                            placeholder="Barcode — press Enter to add"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InputGroupAddon align="inline-end">
                                <Barcode />
                              </InputGroupAddon>
                            </TooltipTrigger>
                            <TooltipContent>Product barcode</TooltipContent>
                          </Tooltip>
                        </InputGroup>
                      </Field>
                      <Field className="w-20">
                        <FieldLabel htmlFor="qty" className="sr-only">
                          Quantity
                        </FieldLabel>
                        <Input
                          id="qty"
                          type="number"
                          name="qty"
                          min={1}
                          value={CFD?.qty ?? 1}
                          onChange={(e) =>
                            setCFD((p) => ({
                              code: p?.code ?? "",
                              qty: Number(e.target.value) || 1,
                            }))
                          }
                        />
                      </Field>
                      <Button
                        variant="secondary"
                        type="button"
                        size="icon"
                        onClick={() => void handleAdd()}
                        disabled={isFetching}
                        className="shrink-0 rounded-full"
                      >
                        {isFetching ? <Spinner /> : <Plus />}
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        className="text-xs"
                        onClick={() => barcodeRef.current?.focus()}
                      >
                        <ScanBarcode className="size-3.5" />
                        Focus scanner
                      </Button>
                      <PosProductPicker
                        className="flex-1 sm:flex-none"
                        defaultQty={CFD?.qty ?? 1}
                        onAdd={(products) => {
                          products.forEach((product) =>
                            addProductLine(product, CFD?.qty ?? 1),
                          );
                        }}
                      />
                    </div>

                    <div className="overflow-hidden rounded-lg border bg-background/60">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Unit</TableHead>
                            <TableHead className="w-16 text-center">Qty</TableHead>
                            <TableHead className="text-right">
                              Discount / unit
                            </TableHead>
                            <TableHead className="text-right">Line total</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lines.map((pr) => {
                            const lineDisc = (pr.discount || 0) * pr.qty;
                            const lineTotal =
                              pr.qty * pr.unit_price - lineDisc;
                            return (
                              <TableRow key={pr.id}>
                                <TableCell className="max-w-[140px]">
                                  <p className="truncate font-medium">
                                    {pr.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Stock: {pr.quantity}
                                  </p>
                                </TableCell>
                                <TableCell className="text-right text-sm">
                                  {formatDisplayAmount(pr.unit_price)}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="h-8 w-14 px-1 text-center"
                                    type="number"
                                    min={1}
                                    max={pr.quantity}
                                    value={pr.qty}
                                    onChange={(e) =>
                                      updateQuantity(
                                        pr.id,
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col items-end gap-0.5">
                                    <Input
                                      className="h-8 w-20 px-1 text-right text-sm"
                                      type="number"
                                      min={0}
                                      max={pr.unit_price}
                                      step={1}
                                      value={pr.discount ?? 0}
                                      onChange={(e) =>
                                        updateLineDiscount(pr.id, e.target.value)
                                      }
                                      aria-label={`Discount per unit for ${pr.name}`}
                                    />
                                    {(pr.discount ?? 0) > 0 && pr.unit_price > 0 && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {percent(
                                          pr.discount ?? 0,
                                          pr.unit_price,
                                          0,
                                        )}
                                        % · −
                                        {formatDisplayAmount(lineDisc)}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">
                                  {formatDisplayAmount(lineTotal)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    type="button"
                                    onClick={() => removeLine(pr.id)}
                                  >
                                    <Trash2 className="size-3.5 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {!lines.length && (
                            <TableRow className="hover:bg-transparent">
                              <TableCell
                                colSpan={6}
                                className="h-24 text-center text-sm text-muted-foreground"
                              >
                                No items yet. Scan a barcode or search the
                                catalog.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <FieldError errors={[{ message: errors?.lines }]} />
                  </ProductFormSection>

                  <ProductFormSection
                    title="Payment"
                    description={
                      onCredit
                        ? "Credit sale — record the advance payment and balance due date."
                        : "Select how the customer is paying today."
                    }
                    icon={CreditCard}
                    accent="emerald"
                  >
                    {!onCredit && (
                      <Field>
                        <FieldLabel htmlFor="method">Payment method</FieldLabel>
                        <Select
                          name="method"
                          required
                          value={method}
                          onValueChange={setMethod}
                        >
                          <SelectTrigger className="w-full" id="method">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethodsAtCheckout.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                <span className="flex items-center gap-2">
                                  <m.icon className="size-4 text-muted-foreground" />
                                  {m.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="tax">Tax amount</FieldLabel>
                        <Input
                          id="tax"
                          type="number"
                          name="tax"
                          min={0}
                          value={tax}
                          onChange={(e) => setTax(e.target.value)}
                          placeholder="0"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="advance">
                          {onCredit ? "Advance paid" : "Amount received"}
                        </FieldLabel>
                        <Input
                          id="advance"
                          type="number"
                          name="advance"
                          min={0}
                          value={advance}
                          onChange={(e) => setAdvance(e.target.value)}
                          placeholder="0"
                        />
                      </Field>
                    </div>

                    {isPartialPayment && (
                      <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-900 dark:text-amber-200">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                        <p>
                          Partial payment will be recorded as credit with a
                          default 15-day due date. Enable{" "}
                          <strong>Credit sale</strong> below to set a custom due
                          date and reason.
                        </p>
                      </div>
                    )}

                    {changeDue > 0 && !onCredit && (
                      <p className="text-xs text-muted-foreground">
                        Change due to customer:{" "}
                        <span className="font-medium text-foreground">
                          {formatDisplayAmount(changeDue)}
                        </span>
                      </p>
                    )}
                  </ProductFormSection>

                  <ProductFormSection
                    title="Credit sale"
                    description="Enable when the full balance will be paid later."
                    icon={FileClock}
                    accent="orange"
                  >
                    <FieldLabel htmlFor="switch-credit" className="cursor-pointer">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Pay on credit</FieldTitle>
                          <FieldDescription>
                            Requires a due date and reason. Status is set to
                            Credit automatically.
                          </FieldDescription>
                        </FieldContent>
                        <Switch
                          id="switch-credit"
                          name="on-credit"
                          checked={onCredit}
                          onCheckedChange={setOnCredit}
                        />
                      </Field>
                    </FieldLabel>
                    <FieldError errors={[{ message: errors?.credit }]} />

                    {onCredit && (
                      <div className="grid gap-4">
                        <Field>
                          <FieldLabel htmlFor="due-date">Due date</FieldLabel>
                          <PickerDropdown
                            open={dueCalendarOpen}
                            onOpenChange={setDueCalendarOpen}
                            className="w-full sm:max-w-[280px]"
                            matchTriggerWidth
                            mobileCenter
                            maxWidth={300}
                            minWidth={260}
                            trigger={
                              <Button
                                id="due-date"
                                type="button"
                                variant="outline"
                                className={cn(
                                  "h-10 w-full touch-manipulation justify-start text-left font-normal sm:h-9",
                                  !dueDate && "text-muted-foreground",
                                )}
                                onClick={() =>
                                  setDueCalendarOpen((prev) => !prev)
                                }
                              >
                                <CalendarIcon className="mr-2 size-4 shrink-0" />
                                <span className="truncate">
                                  {dueDate
                                    ? format(dueDate, "MMM d, yyyy")
                                    : "Pick due date"}
                                </span>
                              </Button>
                            }
                          >
                            <Calendar
                              mode="single"
                              selected={dueDate}
                              onSelect={(date) => {
                                setDueDate(date);
                                if (date) setDueCalendarOpen(false);
                              }}
                              captionLayout="dropdown"
                              defaultMonth={dueDate ?? new Date()}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              className="w-full p-1.5 sm:p-2"
                              classNames={{
                                months: "flex w-full flex-col",
                                month: "w-full space-y-2",
                                table: "w-full",
                                day: "h-9 w-9 p-0 font-normal sm:h-8 sm:w-8",
                              }}
                            />
                          </PickerDropdown>
                          <input
                            type="hidden"
                            name="due-date"
                            value={dueDate?.toISOString() ?? ""}
                            required
                          />
                          <FieldError errors={[{ message: errors?.due }]} />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="reason">Credit reason</FieldLabel>
                          <Textarea
                            id="reason"
                            name="reason"
                            rows={2}
                            placeholder="e.g. Customer will pay at end of month"
                            required
                          />
                          <FieldError errors={[{ message: errors?.reason }]} />
                        </Field>
                      </div>
                    )}
                  </ProductFormSection>
                </div>

                {/* Order summary sidebar */}
                <aside className="lg:sticky lg:top-0 lg:self-start">
                  <div className="rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-card p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold tracking-tight">
                      Order summary
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <dt>Subtotal</dt>
                        <dd>{formatDisplayAmount(subtotal)}</dd>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                          <dt>Discounts</dt>
                          <dd>−{formatDisplayAmount(totalDiscount)}</dd>
                        </div>
                      )}
                      {taxAmount > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <dt>Tax</dt>
                          <dd>{formatDisplayAmount(taxAmount)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                        <dt>Total</dt>
                        <dd>{formatDisplayAmount(grandTotal)}</dd>
                      </div>
                      {paidAmount > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <dt>Received</dt>
                          <dd>{formatDisplayAmount(paidAmount)}</dd>
                        </div>
                      )}
                      {balanceDue > 0 && (
                        <div className="flex justify-between font-medium text-orange-700 dark:text-orange-400">
                          <dt>Balance due</dt>
                          <dd>{formatDisplayAmount(balanceDue)}</dd>
                        </div>
                      )}
                      {changeDue > 0 && (
                        <div className="flex justify-between font-medium text-blue-700 dark:text-blue-400">
                          <dt>Change</dt>
                          <dd>{formatDisplayAmount(changeDue)}</dd>
                        </div>
                      )}
                    </dl>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {lines.length} item{lines.length !== 1 ? "s" : ""} ·{" "}
                      {onCredit ? "Credit sale" : "Standard sale"}
                    </p>
                  </div>
                </aside>
              </div>
            </div>

            <DrawerFooter className="flex-row items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
              <DrawerClose asChild>
                <Button variant="outline" size="sm" type="button">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                size="sm"
                type="submit"
                disabled={isAdding || !lines.length}
                className="auth-submit-btn min-w-[120px] border-0"
              >
                {isAdding && <Spinner />}
                Complete sale
              </Button>
            </DrawerFooter>
          </Form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
