import ClientSelector from "@/components/sales/client-selector";
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
  FieldGroup,
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
import { Barcode, Plus, ScanBarcode, Search, Trash2 } from "lucide-react";
import React from "react";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { AddedLine, Product, ServerActionState } from "types";
import {
  formatAmount,
  formatDisplayAmount,
  genericErrorState,
  percent,
} from "utils";
import { toast } from "sonner";

export function CreateInvoiceDrawer() {
  const actionData = useActionData<ServerActionState & { data?: Product }>();
  const navigation = useNavigation();
  const { scanCode } = useOrganisation();

  const [advance, setAdvance] = useState<string>();
  const [tax, setTax] = useState<string>();
  const [onCredit, setOnCredit] = useState<boolean>();

  // Code field data
  const [CFD, setCFD] = useState<{ code: string; qty: number }>();
  const [lines, setLines] = React.useState<AddedLine[]>([]);

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "create-invoice";

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

  async function handleAdd() {
    if (!CFD) {
      toast.error("Please provide a barcode and amount");
      return;
    }
    const { code, qty } = CFD;
    if (!code.replace("/\D/g", "")) {
      toast.error("Please provide a valid barcode");
      return;
    }
    if (qty < 1) {
      toast.error("Please provide a valid amount");
      return;
    }

    const { data, error } = await refetch();

    if (error) {
      toast.error(genericErrorState().message);
      return;
    }

    if (!data?.data) {
      toast.error(data?.message);
      return;
    }

    const { data: pr } = data;

    setLines((prev) => {
      const existing = prev.find((l) => l.id === pr.id);

      if (existing) {
        // 🔁 update quantity
        return prev.map((l) =>
          l.id === pr.id
            ? { ...l, qty: qty > pr.quantity ? pr.quantity : qty }
            : l,
        );
      }

      //  add new
      return [
        ...prev,
        {
          ...pr,
          qty: qty > pr.quantity ? pr.quantity : qty,
          discount: (pr.unit_price ?? 0) - (pr.promo_price ?? 0),
        },
      ];
    });

    // setCFD(undefined);
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
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button size={"sm"} className="h-8 px-2 lg:px-3 text-xs">
            {isAdding ? <Spinner className="size-4" /> : <Plus size={4} />}
            Create invoice
          </Button>
        </DrawerTrigger>

        {/* Form */}
        <DrawerContent className="data-[vaul-drawer-direction=right]:tablet:max-w-xl data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
          <Form
            method="POST"
            encType="multipart/form-data"
            className=" flex h-full flex-col"
          >
            <DrawerHeader className="px-6 py-4 border-b border-border">
              <DrawerTitle className="text-base font-normal">
                Create a new invoice
              </DrawerTitle>
            </DrawerHeader>

            <div className="no-scrollbar  h-auto  relative flex-1 overflow-y-auto ">
              <input type="hidden" name="intent" value="create-invoice" />
              <input type="hidden" name="lines" value={JSON.stringify(lines)} />

              {/* Basic info */}
              <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
                <Field className="gap-4">
                  <div className="flex flex-col w-1/2 text-wrap">
                    <FieldLabel htmlFor="client-name">
                      Select customer
                    </FieldLabel>
                    <FieldDescription className="text-xs">
                      Choose an existing customer from your records or add a new
                      customer.
                    </FieldDescription>
                  </div>

                  <div className="flex gap-2 w-full items-center">
                    <ClientSelector />
                  </div>

                  <FieldError errors={[{ message: errors?.client }]} />
                </Field>
              </FieldGroup>

              {/* Product Lines */}
              <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
                <Field className="gap-4">
                  <div className="flex flex-col flex-grow">
                    <FieldLabel htmlFor="code">Products</FieldLabel>
                    <FieldDescription className="text-xs">
                      Scan or enter barcode or search to add one or more
                      products to this invoice.
                    </FieldDescription>
                  </div>

                  <div className="flex items-end gap-2">
                    <Field>
                      <InputGroup>
                        <InputGroupInput
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
                          placeholder="Enter the product barcode"
                          required
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
                    <Field className="max-w-25">
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
                        placeholder="Quantity"
                        required
                      />
                    </Field>
                    <Button
                      variant="secondary"
                      type="button"
                      size="icon"
                      onClick={handleAdd}
                      disabled={isFetching}
                      className="rounded-full"
                    >
                      {isFetching ? <Spinner /> : <Plus />}
                    </Button>
                  </div>

                  <div className="flex flex-col tablet:flex-row gap-2 tablet:items-center">
                    <Button
                      size={"sm"}
                      variant={"secondary"}
                      className="w-fit text-xs font-normal"
                      disabled
                    >
                      <ScanBarcode size={4} />
                      Scan barcode
                    </Button>
                    <Button
                      size={"sm"}
                      variant={"secondary"}
                      className="w-fit text-xs font-normal"
                    >
                      <Barcode size={4} />
                      Enter manually
                    </Button>
                    <Button
                      size={"sm"}
                      variant={"secondary"}
                      className="w-fit text-xs font-normal"
                      disabled
                    >
                      <Search size={4} />
                      Search products
                    </Button>
                  </div>

                  <div className="overflow-hidden rounded-md border">
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
                            <TableCell className="font-medium max-w-[150px] truncate">
                              {pr.name}
                            </TableCell>
                            <TableCell>
                              {formatDisplayAmount(pr.unit_price)}
                            </TableCell>
                            <TableCell>{pr.quantity}</TableCell>
                            <TableCell>
                              <Input
                                className="w-18"
                                id="qty"
                                type="number"
                                name="qty"
                                defaultValue={1}
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
                                onClick={() => removeLine(pr.id)}
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!lines.length && (
                          <TableRow className="hover:bg-muted">
                            <TableCell colSpan={6} className="h-32 text-center">
                              No products added yet.
                            </TableCell>
                          </TableRow>
                        )}
                        <FieldError errors={[{ message: errors?.cat }]} />
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
                          <TableCell className="text-right" colSpan={2}>
                            {formatDisplayAmount(totalAfterDiscount)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>

                  <FieldError errors={[{ message: errors?.lines }]} />
                </Field>
              </FieldGroup>

              {/* 💳 Invoice — Payment & Charges */}
              <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
                <Field className="flex-col tablet:flex-row gap-6 ">
                  <div className="flex flex-col flex-grow">
                    <FieldLabel htmlFor="method">Payment Method</FieldLabel>
                    <FieldDescription className="text-xs">
                      How the customer is paying for this invoice.
                    </FieldDescription>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <Select name="method" required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={" "}>
                          Select payment method
                        </SelectItem>
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
                  </div>
                </Field>

                <Field className="flex-col tablet:flex-row gap-6 ">
                  <div className="flex flex-col flex-grow">
                    <FieldLabel htmlFor="tax">Tax Amount (optional)</FieldLabel>
                    <FieldDescription className="text-xs">
                      Tax applied to the invoice total, if applicable.
                    </FieldDescription>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <Input
                      id="tax"
                      type="number"
                      name="tax"
                      value={tax}
                      onChange={(e) => handleAmtInputChange(e, setTax)}
                      placeholder="e.g. 1,200"
                    />
                  </div>
                </Field>

                <Field className="flex-col tablet:flex-row gap-6 ">
                  <div className="flex flex-col flex-grow">
                    <FieldLabel htmlFor="advance">
                      Amount Paid (optional)
                    </FieldLabel>
                    <FieldDescription className="text-xs">
                      Amount paid upfront by the customer.
                    </FieldDescription>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <Input
                      id="advance"
                      type="number"
                      name="advance"
                      value={advance}
                      onChange={(e) => handleAmtInputChange(e, setAdvance)}
                      placeholder="e.g. 1,200"
                    />
                  </div>
                </Field>
              </FieldGroup>

              {/* 🕒 Credit & Status */}
              <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
                <FieldLabel htmlFor="switch-credit" className="p-4 ">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Is this a credit sale?</FieldTitle>
                      <FieldDescription>
                        Enable if payment will be completed at a later date.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="switch-credit"
                      name="on-credit"
                      onCheckedChange={setOnCredit}
                    />
                  </Field>
                </FieldLabel>

                <FieldError errors={[{ message: errors?.credit }]} />
                {onCredit && (
                  <>
                    <Field className="flex-col tablet:flex-row gap-6 ">
                      <div className="flex flex-col flex-grow">
                        <FieldLabel htmlFor="due-date">Due Date</FieldLabel>
                        <FieldDescription className="text-xs">
                          Date when the remaining payment is expected. Required
                          for credit sales.
                        </FieldDescription>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <DateTimePicker
                          placeholder="Pick a date"
                          minDate={new Date(Date.now())}
                          dateLabel=""
                          name="due-date"
                          id="due-date"
                          required
                        />
                        <FieldError errors={[{ message: errors?.due }]} />
                      </div>
                    </Field>

                    <Field className="flex-col tablet:flex-row gap-6 ">
                      <div className="flex flex-col flex-grow">
                        <FieldLabel htmlFor="reason">Credit Reason</FieldLabel>
                        <FieldDescription className="text-xs">
                          Reason for allowing delayed payment. Required for
                          credit sales.
                        </FieldDescription>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <Textarea
                          id="reason"
                          name="reason"
                          placeholder="Reason for allowing delayed payment"
                          required
                        />
                        <FieldError errors={[{ message: errors?.reason }]} />
                      </div>
                    </Field>
                  </>
                )}
              </FieldGroup>

              {/* Status */}
              <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
                <Field className="flex-col tablet:flex-row gap-6 ">
                  <div className="flex flex-col flex-grow">
                    <FieldLabel htmlFor="status">Invoice Status</FieldLabel>
                    <FieldDescription className="text-xs">
                      Current state of the invoice (paid, partial, refunded,
                      cancelled).
                    </FieldDescription>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <Select name="status" required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select option..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={" "}>Select option...</SelectItem>
                        {statuses.map((m, i) => (
                          <SelectItem
                            key={i}
                            value={m.value}
                            className="flex-row"
                          >
                            <span className="flex items-center gap-1">
                              <m.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                              {m.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[{ message: errors?.status }]} />
                  </div>
                </Field>
              </FieldGroup>
            </div>

            <DrawerFooter className="flex-row justify-end border-t border-border px-6 py-4 items-center">
              <div className="flex items-center gap-2 mr-auto">
                <span> Total: {formatDisplayAmount(total)}</span>
              </div>
              <DrawerClose asChild>
                <Button variant="outline" size={"sm"}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button size={"sm"} type="submit" disabled={isAdding}>
                {isAdding && <Spinner />} Create invoice
              </Button>
            </DrawerFooter>
          </Form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
