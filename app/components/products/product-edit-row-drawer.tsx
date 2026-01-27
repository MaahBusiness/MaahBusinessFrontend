import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
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
import { useOrganisation } from "@/hooks/use-organisation";
import React from "react";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import { toast } from "sonner";
import type { Product, ServerActionState } from "types";
import { formatAmount } from "utils";

export function EditProductDrawer({ data }: { data: Product }) {
  const { organisation: res } = useOrganisation();
  const actionData = useActionData<ServerActionState & { data?: Product }>();
  const navigation = useNavigation();

  const initCat = res?.data?.categories?.find((c) => c.id === data.category_id);

  const [cat, setCat] = useState(initCat);
  const [purchase, setPurchase] = useState<string>();
  const [unit, setUnit] = useState<string>();
  const [canExpire, setCanExpire] = useState<boolean>(!!data.expiry_date);

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isUpdating = isSubmitting && intent === "update-product";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: typeof setPurchase,
  ) => {
    const rawInput = e.target.value; // What the user typed
    // const rawNumber = parseInt(rawInput.replace(/\D/g, ""), 10) || 0; // Raw numeric value
    setter(formatAmount(rawInput)); // Update the input display value
  };

  React.useEffect(() => {
    if (intent === "update-product" && actionData?.success)
      toast.success(`${data?.name} has been updated succesfully!`);
  }, [actionData]);

  return (
    <DrawerContent className="border-border data-[vaul-drawer-direction=right]:sm:max-w-xl data-[vaul-drawer-direction=bottom]:max-h-[90vh] focus-visible:outline-0">
      <Form
        method="POST"
        encType="multipart/form-data"
        className=" flex h-full flex-col"
      >
        <DrawerHeader className="px-6 py-4 border-b border-border">
          <DrawerTitle className="text-base font-normal truncate">
            Update '{data.name}'
          </DrawerTitle>
        </DrawerHeader>

        <div className="no-scrollbar  h-auto  relative flex-1 overflow-y-auto ">
          <input type="hidden" name="intent" value="update-product" />
          <input type="hidden" name="id" value={data.id} />

          {/* Basic info */}
          <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="name">Product name</FieldLabel>
                <FieldDescription className="text-xs">
                  This is how the product will appear across the system.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="name"
                  type="text"
                  name="name"
                  defaultValue={data.name}
                  placeholder="e.g. Coca-Cola 500ml"
                  required
                />
                <FieldError errors={[{ message: errors?.name }]} />
              </div>
            </Field>
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="desc">Description (optional)</FieldLabel>
                <FieldDescription className="text-xs">
                  Optional details for internal reference or invoices.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Textarea
                  id="desc"
                  name="desc"
                  defaultValue={data.description}
                  placeholder="Short description or notes about the product"
                />
              </div>
            </Field>
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="code">Barcode / SKU (optional)</FieldLabel>
                <FieldDescription className="text-xs">
                  Used for quick lookup at checkout or stock tracking. Will be
                  automatically generated if empty.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="code"
                  name="code"
                  type="text"
                  defaultValue={data.barcode}
                  placeholder="Scan or enter barcode"
                />
              </div>
            </Field>
          </FieldGroup>

          {/* Category */}
          <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="cat">Category</FieldLabel>
                <FieldDescription className="text-xs">
                  Required for reporting and filtering.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Select
                  name="cat"
                  required
                  defaultValue={data.category_id}
                  onValueChange={(val) => {
                    setCat(res?.data?.categories?.find((c) => c.id === val));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={" "}>Select a category</SelectItem>
                    {res?.data?.categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[{ message: errors?.cat }]} />
              </div>
            </Field>
            {cat?.subcategories?.length ? (
              <Field className="flex-row gap-6 ">
                <div className="flex flex-col flex-grow">
                  <FieldLabel htmlFor="subcat">
                    Subategory (optional)
                  </FieldLabel>
                  <FieldDescription className="text-xs">
                    Helps further organise products.
                  </FieldDescription>
                </div>
                <div className="flex flex-col flex-grow">
                  <Select name="subcat" defaultValue={data.subcategory_id}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {cat?.subcategories?.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Field>
            ) : (
              <></>
            )}
          </FieldGroup>

          {/* Pricing */}
          <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="purchase">Purchase price</FieldLabel>
                <FieldDescription className="text-xs">
                  Cost price (used for profit calculations).
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="purchase"
                  type="text"
                  name="purchase"
                  defaultValue={formatAmount(`${data.purchase_price}`)}
                  value={purchase}
                  onChange={(e) => handleInputChange(e, setPurchase)}
                  placeholder="e.g. 1,200.00"
                  required
                />
                <FieldError errors={[{ message: errors?.purchase }]} />
              </div>
            </Field>
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="unit">Selling price</FieldLabel>
                <FieldDescription className="text-xs">
                  Price customers will pay.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="unit"
                  type="text"
                  name="unit"
                  defaultValue={formatAmount(`${data.unit_price}`)}
                  value={unit}
                  onChange={(e) => handleInputChange(e, setUnit)}
                  placeholder="e.g. 1,200.00"
                  required
                />
                <FieldError errors={[{ message: errors?.unit }]} />
              </div>
            </Field>
          </FieldGroup>

          {/* Inventory */}
          <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="qty">
                  Initial stock quantity (optional)
                </FieldLabel>
                <FieldDescription className="text-xs">
                  Leave empty if stock will be added later.{" "}
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="qty"
                  type="number"
                  name="qty"
                  defaultValue={data.quantity}
                  placeholder="e.g. 50"
                />
              </div>
            </Field>
            <Field className="flex-row gap-6 ">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="min">
                  Low stock alert threshold (optional)
                </FieldLabel>
                <FieldDescription className="text-xs">
                  You’ll be notified when stock drops below this number.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="min"
                  type="number"
                  name="min"
                  defaultValue={data.min_quantity}
                  placeholder="e.g. 50"
                />
                <FieldError errors={[{ message: errors?.min }]} />
              </div>
            </Field>
          </FieldGroup>

          {/* Expiry */}
          <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
            <FieldLabel htmlFor="switch-exp" className="p-4 ">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>This product can expire</FieldTitle>
                  <FieldDescription>
                    Enable to apply if the product is perishable.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="switch-exp"
                  name="can-exp"
                  defaultChecked={!!data.expiry_date}
                  onCheckedChange={setCanExpire}
                />
              </Field>
            </FieldLabel>
            {canExpire && (
              <Field className="flex-row gap-6 ">
                <div className="flex flex-col flex-grow">
                  <FieldLabel htmlFor="exp">Expiry date</FieldLabel>
                  <FieldDescription className="text-xs">
                    Used for expiry alerts and reports.
                  </FieldDescription>
                </div>
                <div className="flex flex-col flex-grow">
                  <DateTimePicker
                    placeholder="Pick a date"
                    dateLabel=""
                    name="exp"
                    id="exp"
                    required
                    value={new Date(data.expiry_date ?? "")}
                  />
                </div>
              </Field>
            )}
          </FieldGroup>
        </div>
        <DrawerFooter className="flex-row justify-end border-t border-border px-6 py-4">
          <DrawerClose asChild>
            <Button variant="outline" size={"sm"}>
              Cancel
            </Button>
          </DrawerClose>
          <Button size={"sm"} type="submit" disabled={isUpdating}>
            {isUpdating && <Spinner />} Update
          </Button>
        </DrawerFooter>
      </Form>
    </DrawerContent>
  );
}
