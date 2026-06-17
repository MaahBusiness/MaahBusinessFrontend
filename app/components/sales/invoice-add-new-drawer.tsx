import ClientSelector from "@/components/sales/client-selector";
import { PosProductSearchDialog } from "@/components/sales/pos-product-search-dialog";
import { ProductFormSection } from "@/components/products/product-form-section";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
  TableFooter,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganisation } from "@/hooks/use-organisation";
import { methods, statuses } from "@/routes/dashboard/sales/data";
import {
  Barcode,
  CreditCard,
  FileText,
  Plus,
  Receipt,
  ScanBarcode,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { AddedLine, Product, ServerActionState } from "types";
import {
  formatDisplayAmount,
  genericErrorState,
  percent,
} from "utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CreateInvoiceDrawer({
  variant = "toolbar",
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  formAction,
}: {
  variant?: "toolbar" | "hero";
  defaultOpen?: boolean;
  /** Controlled open state (e.g. from `?new=1` on the sales page). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** POST target when the drawer is used outside the sales route */
  formAction?: string;
}) {
  const actionData = useActionData<ServerActionState & { data?: Product }>();
  const navigation = useNavigation();
  const { scanCode } = useOrganisation();

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [searchOpen, setSearchOpen] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [advance, setAdvance] = useState<string>();
  const [tax, setTax] = useState<string>();
  const [onCredit, setOnCredit] = useState<boolean>();
  const [method, setMethod] = useState("cash");
  const [status, setStatus] = useState("COMPLETED");

  // Code field data
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
      setAdvance(undefined);
      setTax(undefined);
      setOnCredit(false);
      setCFD(undefined);
      setMethod("cash");
      setStatus("COMPLETED");
      setOpen(false);
      return;
    }

    if (actionData.errors) {
      const messages = Object.values(actionData.errors).filter(Boolean);
      if (messages.length) toast.error(messages[0] as string);
    } else if (actionData.message) {
      toast.error(actionData.message);
    }
  }, [actionData, navigation.state]);

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
      // const discount = (l.unit_price ?? 0) - (l.promo_price ?? 0);

      acc.subtotal += lineTotal;
      acc.totalDiscount += discount; // or discount * l.quantity
      // acc.totalDiscount += discount * l.qty;
      return acc;
    },
    { subtotal: 0, totalDiscount: 0 },
  );

  const totalAfterDiscount = subtotal - totalDiscount;
  const total =
    totalAfterDiscount + (parseInt(`${tax}`.replace(/\D/g, ""), 10) || 0);

  useEffect(() => {
    if (onCredit) return;
    if (!lines.length) {
      setAdvance(undefined);
      return;
    }
    setAdvance(String(totalAfterDiscount));
  }, [lines, onCredit, totalAfterDiscount]);

  useEffect(() => {
    if (onCredit) {
      setStatus("CREDIT");
      return;
    }
    setStatus("COMPLETED");
  }, [onCredit]);

  async function handleAdd() {
    if (!CFD) {
      toast.error("Please provide a barcode and quantity");
      return;
    }
    const { code, qty } = CFD;
    if (!code.trim()) {
      toast.error("Please provide a valid barcode");
      return;
    }
    if (qty < 1) {
      toast.error("Please provide a valid quantity");
      return;
    }

    const { data, error } = await refetch();

    if (error) {
      toast.error(genericErrorState().message);
      return;
    }

    if (!data?.data) {
      toast.error(data?.message ?? "Product not found");
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
            ? { ...l, qty: qty > pr.quantity ? pr.quantity : qty }
            : l,
        );
      }

      return [
        ...prev,
        {
          ...pr,
          qty: qty > pr.quantity ? pr.quantity : qty,
          discount: (pr.unit_price ?? 0) - (pr.promo_price ?? 0),
        },
      ];
    });
  }

  const updateQuantity = (id: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)));
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAmtInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: typeof setAdvance,
  ) => {
    const rawInput = e.target.value; // What the user typed
    // setter(formatAmount(rawInput)); // Update the input display value
    setter(rawInput);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Drawer direction="right" open={open} onOpenChange={setOpen}>
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
            {variant === "hero" ? "New sale" : "Create invoice"}
          </Button>
        </DrawerTrigger>

        <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
          <Form
            method="POST"
            action={formAction}
            encType="multipart/form-data"
            className="flex h-full flex-col"
          >
            <DrawerHeader className="border-b border-violet-500/15 bg-gradient-to-r from-violet-500/10 via-card to-blue-500/5 px-6 py-5">
              <DrawerTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Receipt className="size-5 text-violet-600" />
                New sale
              </DrawerTitle>
              <p className="text-sm text-muted-foreground">
                Add products, choose a customer, and record payment.
              </p>
            </DrawerHeader>

            <div className="no-scrollbar relative flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              <input type="hidden" name="intent" value="create-invoice" />
              <input type="hidden" name="lines" value={JSON.stringify(lines)} />

              <ProductFormSection
                title="Customer"
                description="Select an existing customer or add a new one."
                icon={UserRound}
                accent="violet"
              >
                <ClientSelector />
                <FieldError errors={[{ message: errors?.client }]} />
              </ProductFormSection>

              <ProductFormSection
                title="Products"
                description="Scan or enter a barcode to add items to this sale."
                icon={Barcode}
                accent="blue"
              >
                <div className="flex flex-wrap items-end gap-2">
                  <Field className="min-w-[180px] flex-1">
                    <InputGroup>
                      <InputGroupInput
                        ref={barcodeRef}
                        id="code"
                        name="code"
                        type="text"
                        value={CFD?.code}
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
                        placeholder="Scan or type barcode, then Enter"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InputGroupAddon align="inline-end">
                            <Barcode />
                          </InputGroupAddon>
                        </TooltipTrigger>
                        <TooltipContent>Barcode</TooltipContent>
                      </Tooltip>
                    </InputGroup>
                  </Field>
                  <Field className="w-24">
                    <Input
                      id="qty"
                      type="number"
                      name="qty"
                      min={1}
                      value={CFD?.qty}
                      onChange={(e) =>
                        setCFD((p) => ({
                          code: p?.code ?? "",
                          qty: Number(e.target.value ?? 0),
                        }))
                      }
                      placeholder="Qty"
                    />
                  </Field>
                  <Button
                    variant="secondary"
                    type="button"
                    size="icon"
                    onClick={handleAdd}
                    disabled={isFetching}
                    className="shrink-0 rounded-full"
                  >
                    {isFetching ? <Spinner /> : <Plus />}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className="text-xs font-normal"
                    onClick={() => barcodeRef.current?.focus()}
                  >
                    <ScanBarcode className="size-3.5" />
                    Scan barcode
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className="text-xs font-normal"
                    onClick={() => barcodeRef.current?.focus()}
                  >
                    <Barcode className="size-3.5" />
                    Enter manually
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className="text-xs font-normal"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="size-3.5" />
                    Search products
                  </Button>
                </div>

                <PosProductSearchDialog
                  open={searchOpen}
                  onOpenChange={setSearchOpen}
                  onSelect={(product) => addProductLine(product, CFD?.qty ?? 1)}
                />

                <div className="overflow-hidden rounded-lg border bg-background/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell className="max-w-[150px] truncate font-medium">
                            {pr.name}
                          </TableCell>
                          <TableCell>
                            {formatDisplayAmount(pr.unit_price)}
                          </TableCell>
                          <TableCell>{pr.quantity}</TableCell>
                          <TableCell>
                            <Input
                              className="w-18"
                              type="number"
                              max={pr.quantity}
                              value={pr.qty}
                              onChange={(e) =>
                                updateQuantity(pr.id, Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell
                            title={formatDisplayAmount(pr.promo_price ?? 0)}
                          >
                            {percent(pr.discount ?? 0, pr.unit_price, 2)}%
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon-sm"
                              variant="secondary"
                              type="button"
                              onClick={() => removeLine(pr.id)}
                            >
                              <Trash2 className="text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!lines.length && (
                        <TableRow className="hover:bg-muted/50">
                          <TableCell
                            colSpan={6}
                            className="h-28 text-center text-muted-foreground"
                          >
                            No products yet. Scan a barcode, press Enter, or
                            search by name.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4}>Subtotal</TableCell>
                        <TableCell className="text-right" colSpan={2}>
                          {formatDisplayAmount(subtotal)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4}>Discounts</TableCell>
                        <TableCell className="text-right" colSpan={2}>
                          {formatDisplayAmount(totalDiscount)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4}>Total</TableCell>
                        <TableCell className="text-right font-semibold" colSpan={2}>
                          {formatDisplayAmount(totalAfterDiscount)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
                <FieldError errors={[{ message: errors?.lines }]} />
              </ProductFormSection>

              <ProductFormSection
                title="Payment"
                description="How the customer is paying for this sale."
                icon={CreditCard}
                accent="emerald"
              >
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
                      {methods.map((m, i) => (
                        <SelectItem key={i} value={m.value}>
                          <span className="flex items-center gap-1">
                            <m.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {m.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="tax">Tax (optional)</FieldLabel>
                    <Input
                      id="tax"
                      type="number"
                      name="tax"
                      value={tax}
                      onChange={(e) => handleAmtInputChange(e, setTax)}
                      placeholder="e.g. 1,200"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="advance">Amount paid (optional)</FieldLabel>
                    <Input
                      id="advance"
                      type="number"
                      name="advance"
                      value={advance}
                      onChange={(e) => handleAmtInputChange(e, setAdvance)}
                      placeholder="e.g. 1,200"
                    />
                  </Field>
                </div>
              </ProductFormSection>

              <ProductFormSection
                title="Credit sale"
                description="Enable if payment will be completed later."
                icon={CreditCard}
                accent="orange"
              >
                <FieldLabel htmlFor="switch-credit" className="cursor-pointer">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Credit sale?</FieldTitle>
                      <FieldDescription>
                        Remaining balance due on a future date.
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="due-date">Due date</FieldLabel>
                      <DateTimePicker
                        placeholder="Pick a date"
                        minDate={new Date(Date.now())}
                        dateLabel=""
                        name="due-date"
                        id="due-date"
                        required
                      />
                      <FieldError errors={[{ message: errors?.due }]} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="reason">Credit reason</FieldLabel>
                      <Textarea
                        id="reason"
                        name="reason"
                        placeholder="Why is payment delayed?"
                        required
                      />
                      <FieldError errors={[{ message: errors?.reason }]} />
                    </Field>
                  </div>
                )}
              </ProductFormSection>

              <ProductFormSection
                title="Status"
                description="Current state of the invoice."
                icon={FileText}
                accent="rose"
              >
                <Select
                  name="status"
                  required
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((m, i) => (
                      <SelectItem key={i} value={m.value}>
                        <span className="flex items-center gap-1">
                          <m.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {m.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[{ message: errors?.status }]} />
              </ProductFormSection>
            </div>

            <DrawerFooter className="flex-row items-center justify-end border-t border-border bg-muted/30 px-6 py-4">
              <div className="mr-auto text-sm font-semibold">
                Total: {formatDisplayAmount(total)}
              </div>
              <DrawerClose asChild>
                <Button variant="outline" size="sm" type="button">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                size="sm"
                type="submit"
                disabled={isAdding || !lines.length}
                className="auth-submit-btn border-0"
              >
                {isAdding && <Spinner />}
                Create sale
              </Button>
            </DrawerFooter>
          </Form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
