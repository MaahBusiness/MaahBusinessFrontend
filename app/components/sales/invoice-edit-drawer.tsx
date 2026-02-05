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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { methods, statuses } from "@/routes/dashboard/sales/data";
import { Plus } from "lucide-react";
import React from "react";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { Invoice, Product, ServerActionState } from "types";
import { formatAmount } from "utils";

export function EditInvoiceDrawer({ data }: { data: Invoice }) {
  const actionData = useActionData<ServerActionState & { data?: Product }>();
  const navigation = useNavigation();

  const [advance, setAdvance] = useState<string>();
  const [tax, setTax] = useState<string>();
  const [onCredit, setOnCredit] = useState<boolean>(data.is_credit_settled);

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "update-invoice";

  const total =
    Number(data.total) + (parseInt(`${tax}`.replace(/\D/g, ""), 10) || 0);

  const handleAmtInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: typeof setAdvance,
  ) => {
    const rawInput = e.target.value; // What the user typed
    // setter(formatAmount(rawInput)); // Update the input display value
    setter(rawInput);
  };

  return (
    <DrawerContent className=" data-[vaul-drawer-direction=right]:sm:max-w-xl data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
      <Form
        method="POST"
        encType="multipart/form-data"
        className=" flex h-full flex-col"
      >
        <DrawerHeader className="px-6 py-4 border-b border-border">
          <DrawerTitle className="text-base font-normal">
            Update Invoice #{data.number}
          </DrawerTitle>
        </DrawerHeader>

        <div className="no-scrollbar  h-auto  relative flex-1 overflow-y-auto ">
          <input type="hidden" name="intent" value="update-invoice" />
          <input type="hidden" name="invId" value={data.id} />
          <input type="hidden" name="total" value={data.total} />

          {/* 💳 Invoice — Payment & Charges */}
          <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="method">Payment Method</FieldLabel>
                <FieldDescription className="text-xs">
                  How the customer is paying for this invoice.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Select
                  name="method"
                  defaultValue={data.payment_method}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={" "}>Select payment method</SelectItem>
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

            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="tax">Tax Amount</FieldLabel>
                <FieldDescription className="text-xs">
                  Tax applied to the invoice total, if applicable.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="tax"
                  type="number"
                  name="tax"
                  defaultValue={data.tax}
                  value={tax}
                  onChange={(e) => handleAmtInputChange(e, setTax)}
                  placeholder="e.g. 1,200"
                />
              </div>
            </Field>

            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="advance">Amount Paid </FieldLabel>
                <FieldDescription className="text-xs">
                  Amount paid upfront by the customer. (Max: {total})
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="advance"
                  type="number"
                  name="advance"
                  defaultValue={data.advance_paid}
                  max={total}
                  value={advance}
                  onChange={(e) => handleAmtInputChange(e, setAdvance)}
                  placeholder="e.g. 1,200"
                />
              </div>
            </Field>
          </FieldGroup>

          {/* 🕒 Credit & Status */}
          {!!data.remaining_amount && (
            <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
              <FieldLabel htmlFor="switch-credit" className="p-4 ">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Has this credit been settled?</FieldTitle>
                    <FieldDescription>
                      Enable if credit payement has been settled completly.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-credit"
                    name="on-credit"
                    defaultChecked={data.is_credit_settled}
                    onCheckedChange={setOnCredit}
                  />
                </Field>
              </FieldLabel>

              <FieldError errors={[{ message: errors?.credit }]} />
              {!onCredit && (
                <>
                  <Field className="flex-row gap-6 ">
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
                        value={new Date(data.due_date ?? "")}
                        dateLabel=""
                        name="due-date"
                        id="due-date"
                        required
                      />
                      <FieldError errors={[{ message: errors?.due }]} />
                    </div>
                  </Field>

                  <Field className="flex-row gap-6 ">
                    <div className="flex flex-col flex-grow">
                      <FieldLabel htmlFor="reason">Credit Reason</FieldLabel>
                      <FieldDescription className="text-xs">
                        Reason for allowing delayed payment. Required for credit
                        sales.
                      </FieldDescription>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Textarea
                        id="reason"
                        name="reason"
                        placeholder="Reason for allowing delayed payment"
                        defaultValue={data.reason}
                        required
                      />
                      <FieldError errors={[{ message: errors?.reason }]} />
                    </div>
                  </Field>
                </>
              )}
            </FieldGroup>
          )}

          {/* Status */}
          <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="status">Invoice Status</FieldLabel>
                <FieldDescription className="text-xs">
                  Current state of the invoice (paid, partial, refunded,
                  cancelled).
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Select name="status" defaultValue={data.status} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select option..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={" "}>Select option...</SelectItem>
                    {statuses.map((m, i) => (
                      <SelectItem key={i} value={m.value} className="flex-row">
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

          {/* Archive */}
          <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
            <FieldLabel
              htmlFor="switch-archive"
              className="p-4 border-destructive"
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle className={"text-destructive"}>
                    Archive invoice?
                  </FieldTitle>
                  <FieldDescription className="text-xs">
                    This will hide the invoice from your lists. It can still be
                    accessed from the archives page.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="switch-archive"
                  name="archived"
                  defaultChecked={data.is_archived}
                />
              </Field>
            </FieldLabel>
          </FieldGroup>
        </div>

        <DrawerFooter className="flex-row justify-end border-t border-border px-6 py-4 items-center">
          <DrawerClose asChild>
            <Button variant="outline" size={"sm"}>
              Cancel
            </Button>
          </DrawerClose>
          <Button size={"sm"} type="submit" disabled={isAdding}>
            {isAdding && <Spinner />} Update invoice
          </Button>
        </DrawerFooter>
      </Form>
    </DrawerContent>
  );
}
