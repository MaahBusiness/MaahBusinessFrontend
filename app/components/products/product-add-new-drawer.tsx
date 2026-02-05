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
import FileUploadInput from "@/components/ui/file-upload-input";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";

import type { Category, Product, ServerActionState } from "types";
import { formatAmount } from "utils";

export function AddProductDrawer() {
  const { organisation: res } = useOrganisation();
  const actionData = useActionData<ServerActionState & { data?: Product }>();
  const navigation = useNavigation();

  const [cat, setCat] = useState<Category>();
  const [purchase, setPurchase] = useState<string>();
  const [unit, setUnit] = useState<string>();
  const [promo, setPromo] = useState<string>();
  const [onPromo, setOnPromo] = useState<boolean>();
  const [canExpire, setCanExpire] = useState<boolean>();

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isAdding = isSubmitting && intent === "add-product";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: typeof setPurchase,
  ) => {
    const rawInput = e.target.value; // What the user typed
    // const rawNumber = parseInt(rawInput.replace(/\D/g, ""), 10) || 0; // Raw numeric value
    // setter(formatAmount(rawInput)); // Update the input display value
    setter(rawInput); // Update the input display value
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button size={"sm"} className="h-8 px-2 lg:px-3 text-xs">
            {isAdding ? <Spinner className="size-4" /> : <Plus size={4} />}
            Add new
          </Button>
        </DrawerTrigger>

        {/* Form */}
        <DrawerContent className="border-border data-[vaul-drawer-direction=right]:sm:max-w-xl data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
          <Form
            method="POST"
            encType="multipart/form-data"
            className=" flex h-full flex-col"
          >
            <DrawerHeader className="px-6 py-4 border-b border-border">
              <DrawerTitle className="text-base font-normal">
                Add a new product
              </DrawerTitle>
            </DrawerHeader>

            <div className="no-scrollbar  h-auto  relative flex-1 overflow-y-auto ">
              <input type="hidden" name="intent" value="add-product" />

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
                      placeholder="e.g. Coca-Cola 500ml"
                      required
                    />
                    <FieldError errors={[{ message: errors?.name }]} />
                  </div>
                </Field>
                <Field className="flex-row gap-6 ">
                  <div className="flex flex-col flex-grow">
                    <FieldLabel htmlFor="desc">
                      Description (optional)
                    </FieldLabel>
                    <FieldDescription className="text-xs">
                      Optional details for internal reference or invoices.
                    </FieldDescription>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <Textarea
                      id="desc"
                      name="desc"
                      placeholder="Short description or notes about the product"
                    />
                  </div>
                </Field>
                <Field className="flex-row gap-6 ">
                  <div className="flex flex-col flex-grow">
                    <FieldLabel htmlFor="code">
                      Barcode / SKU (optional)
                    </FieldLabel>
                    <FieldDescription className="text-xs">
                      Used for quick lookup at checkout or stock tracking. Will
                      be automatically generated if empty.
                    </FieldDescription>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <Input
                      id="code"
                      name="code"
                      type="text"
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
                      onValueChange={(val) => {
                        setCat(
                          res?.data?.categories?.find((c) => c.id === val),
                        );
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
                      <Select name="subcat">
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
                      type="number"
                      name="purchase"
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
                      type="number"
                      name="unit"
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
                      />
                    </div>
                  </Field>
                )}
              </FieldGroup>

              {/* Promotions */}
              <FieldGroup className="flex flex-col border-b border-border py-6 px-6">
                <FieldLabel htmlFor="switch-promo" className="p-4 ">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>This product is on promotion</FieldTitle>
                      <FieldDescription>
                        Enable to apply a discounted price for a limited time.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="switch-promo"
                      name="on-promo"
                      onCheckedChange={setOnPromo}
                    />
                  </Field>
                </FieldLabel>
                {onPromo && (
                  <>
                    <Field className="flex-row gap-6 ">
                      <div className="flex flex-col flex-grow">
                        <FieldLabel htmlFor="promo-start">
                          Promotion start date
                        </FieldLabel>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <DateTimePicker
                          id="promo-start"
                          name="promo-start"
                          dateLabel=""
                          placeholder="Select start date"
                          required
                        />
                      </div>
                    </Field>
                    <Field className="flex-row gap-6 ">
                      <div className="flex flex-col flex-grow">
                        <FieldLabel htmlFor="promo-end">
                          Promotion end date
                        </FieldLabel>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <DateTimePicker
                          id="promo-end"
                          name="promo-end"
                          dateLabel=""
                          placeholder="Select end date"
                          required
                          error={errors?.promo_end}
                        />
                      </div>
                      {/* <FieldError errors={[{ message: errors?.promo_end }]} /> */}
                    </Field>
                    <Field className="flex-row gap-6 ">
                      <div className="flex flex-col flex-grow">
                        <FieldLabel htmlFor="promo">
                          Promotional price
                        </FieldLabel>
                        <FieldDescription className="text-xs">
                          Must be lower than the regular selling price
                        </FieldDescription>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <Input
                          id="promo"
                          type="number"
                          name="promo"
                          value={promo}
                          onChange={(e) => handleInputChange(e, setPromo)}
                          placeholder="e.g. 1,200.00"
                          required
                        />
                        <FieldError errors={[{ message: errors?.promo }]} />
                      </div>
                    </Field>
                  </>
                )}
              </FieldGroup>

              {/* Image */}
              <FieldGroup className="flex flex-col  py-6 px-6">
                <Field className="gap-6">
                  <div className="flex flex-row gap-6">
                    <div className="flex flex-col flex-grow">
                      <FieldLabel htmlFor="pfp">
                        Product image (optional)
                      </FieldLabel>
                      <FieldDescription className="text-xs">
                        Used for official communications and notifications.
                      </FieldDescription>
                    </div>
                    <div className="flex flex-col flex-grow w-1/2">
                      <FieldDescription className="text-xs ">
                        Upload an image from your device or provide a URL. For
                        images: PNG, JPG, or SVG · Max 2MB
                      </FieldDescription>
                    </div>
                  </div>

                  <FileUploadInput />
                </Field>
              </FieldGroup>
            </div>
            <DrawerFooter className="flex-row justify-end border-t border-border px-6 py-4">
              <DrawerClose asChild>
                <Button variant="outline" size={"sm"}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button size={"sm"} type="submit" disabled={isAdding}>
                {isAdding && <Spinner />} Add product
              </Button>
            </DrawerFooter>
          </Form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
