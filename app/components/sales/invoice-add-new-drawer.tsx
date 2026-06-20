import ClientSelector from "@/components/sales/client-selector";
import { PickerDropdown } from "@/components/sales/picker-dropdown";
import { PosProductPicker } from "@/components/sales/pos-product-search-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
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
import { useOrganisation } from "@/hooks/use-organisation";
import { paymentMethodsAtCheckout } from "@/routes/dashboard/sales/data";
import {
  Barcode,
  CalendarIcon,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { AddedLine, Product, ServerActionState } from "types";
import { formatDisplayAmount, genericErrorState } from "utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function parseAmount(raw: string | undefined): number {
  return parseInt(`${raw ?? ""}`.replace(/\D/g, ""), 10) || 0;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
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
        </DialogTrigger>

        <DialogContent
          showCloseButton
          className="flex max-h-[min(92vh,680px)] w-[calc(100%-1.5rem)] max-w-[540px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[540px]"
        >
          <Form
            method="POST"
            action={formAction}
            encType="multipart/form-data"
            className="flex min-h-0 flex-1 flex-col"
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
            <DialogHeader className="shrink-0 border-b px-5 py-4">
              <DialogTitle className="text-base font-semibold">
                New sale
              </DialogTitle>
            </DialogHeader>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <input type="hidden" name="intent" value="create-invoice" />
              <input type="hidden" name="lines" value={JSON.stringify(lines)} />
              {onCredit && (
                <input type="hidden" name="method" value="credit" />
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <SectionLabel>Customer</SectionLabel>
                  <ClientSelector allowWalkIn />
                  <FieldError errors={[{ message: errors?.client }]} />
                </div>

                <div className="space-y-2">
                  <SectionLabel>Items</SectionLabel>
                  <div className="flex gap-2">
                    <Field className="min-w-0 flex-1">
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
                          placeholder="Scan or enter barcode"
                          className="h-9"
                        />
                        <InputGroupAddon align="inline-end">
                          <Barcode className="size-4 text-muted-foreground" />
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
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
                      className="h-9 w-14 px-2 text-center"
                      aria-label="Quantity"
                    />
                    <Button
                      variant="secondary"
                      type="button"
                      size="icon"
                      className="size-9 shrink-0"
                      onClick={() => void handleAdd()}
                      disabled={isFetching}
                    >
                      {isFetching ? <Spinner /> : <Plus className="size-4" />}
                    </Button>
                  </div>

                  <PosProductPicker
                    className="w-full"
                    defaultQty={CFD?.qty ?? 1}
                    onAdd={(products) => {
                      products.forEach((product) =>
                        addProductLine(product, CFD?.qty ?? 1),
                      );
                    }}
                  />

                  <div className="overflow-hidden rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-8 text-xs">Product</TableHead>
                          <TableHead className="h-8 w-12 text-center text-xs">
                            Qty
                          </TableHead>
                          <TableHead className="h-8 w-14 text-right text-xs">
                            Disc.
                          </TableHead>
                          <TableHead className="h-8 text-right text-xs">
                            Total
                          </TableHead>
                          <TableHead className="h-8 w-8" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lines.map((pr) => {
                          const lineDisc = (pr.discount || 0) * pr.qty;
                          const lineTotal = pr.qty * pr.unit_price - lineDisc;
                          return (
                            <TableRow key={pr.id}>
                              <TableCell className="max-w-[140px] py-2">
                                <p className="truncate text-sm font-medium">
                                  {pr.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {formatDisplayAmount(pr.unit_price)}
                                </p>
                              </TableCell>
                              <TableCell className="py-2">
                                <Input
                                  className="h-7 w-11 px-1 text-center text-xs"
                                  type="number"
                                  min={1}
                                  max={pr.quantity}
                                  value={pr.qty}
                                  onChange={(e) =>
                                    updateQuantity(pr.id, Number(e.target.value))
                                  }
                                />
                              </TableCell>
                              <TableCell className="py-2">
                                <Input
                                  className="h-7 w-12 px-1 text-right text-xs"
                                  type="number"
                                  min={0}
                                  max={pr.unit_price}
                                  step={1}
                                  value={pr.discount ?? 0}
                                  onChange={(e) =>
                                    updateLineDiscount(pr.id, e.target.value)
                                  }
                                  aria-label={`Discount for ${pr.name}`}
                                />
                              </TableCell>
                              <TableCell className="py-2 text-right text-sm font-medium">
                                {formatDisplayAmount(lineTotal)}
                              </TableCell>
                              <TableCell className="py-2">
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  type="button"
                                  className="size-7"
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
                              colSpan={5}
                              className="h-16 text-center text-xs text-muted-foreground"
                            >
                              No items added
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <FieldError errors={[{ message: errors?.lines }]} />
                </div>

                <div className="space-y-3">
                  <SectionLabel>Payment</SectionLabel>

                  <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
                    <span className="text-sm">Credit sale</span>
                    <Switch
                      id="switch-credit"
                      name="on-credit"
                      checked={onCredit}
                      onCheckedChange={setOnCredit}
                    />
                  </div>
                  <FieldError errors={[{ message: errors?.credit }]} />

                  {!onCredit && (
                    <Field>
                      <FieldLabel htmlFor="method" className="text-xs">
                        Method
                      </FieldLabel>
                      <Select
                        name="method"
                        required
                        value={method}
                        onValueChange={setMethod}
                      >
                        <SelectTrigger className="h-9 w-full" id="method">
                          <SelectValue placeholder="Payment method" />
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

                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor="tax" className="text-xs">
                        Tax
                      </FieldLabel>
                      <Input
                        id="tax"
                        type="number"
                        name="tax"
                        min={0}
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                        placeholder="0"
                        className="h-9"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="advance" className="text-xs">
                        {onCredit ? "Advance" : "Received"}
                      </FieldLabel>
                      <Input
                        id="advance"
                        type="number"
                        name="advance"
                        min={0}
                        value={advance}
                        onChange={(e) => setAdvance(e.target.value)}
                        placeholder="0"
                        className="h-9"
                      />
                    </Field>
                  </div>

                  {onCredit && (
                    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
                      <Field>
                        <FieldLabel htmlFor="due-date" className="text-xs">
                          Due date
                        </FieldLabel>
                        <PickerDropdown
                          open={dueCalendarOpen}
                          onOpenChange={setDueCalendarOpen}
                          className="w-full"
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
                                "h-9 w-full justify-start text-left font-normal",
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
                                  : "Select date"}
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
                        <FieldLabel htmlFor="reason" className="text-xs">
                          Reason
                        </FieldLabel>
                        <Textarea
                          id="reason"
                          name="reason"
                          rows={2}
                          placeholder="Why is this on credit?"
                          required
                          className="min-h-[60px] resize-none text-sm"
                        />
                        <FieldError errors={[{ message: errors?.reason }]} />
                      </Field>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t bg-muted/20 px-5 py-3">
              <div className="mb-3 flex items-end justify-between gap-4 text-sm">
                <div className="space-y-0.5 text-muted-foreground">
                  <p>
                    {lines.length} item{lines.length !== 1 ? "s" : ""}
                    {totalDiscount > 0 && (
                      <span className="ml-1.5 text-emerald-600 dark:text-emerald-400">
                        · −{formatDisplayAmount(totalDiscount)} disc.
                      </span>
                    )}
                  </p>
                  {balanceDue > 0 && (
                    <p className="text-orange-600 dark:text-orange-400">
                      Due {formatDisplayAmount(balanceDue)}
                    </p>
                  )}
                  {changeDue > 0 && !onCredit && (
                    <p>
                      Change {formatDisplayAmount(changeDue)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatDisplayAmount(grandTotal)}
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  size="sm"
                  type="submit"
                  disabled={isAdding || !lines.length}
                  className="auth-submit-btn min-w-[110px] border-0"
                >
                  {isAdding && <Spinner />}
                  Complete sale
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
