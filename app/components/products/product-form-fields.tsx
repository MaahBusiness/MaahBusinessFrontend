import { useState } from "react";
import {
  Barcode,
  Boxes,
  FolderTree,
  ImageIcon,
  Package,
  Percent,
  Tag,
  Timer,
} from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ProductFormSection } from "@/components/products/product-form-section";
import { useOrganisation } from "@/hooks/use-organisation";
import type { Category, Product } from "types";

type ProductFormFieldsProps = {
  mode: "add" | "edit";
  data?: Product;
  errors?: Record<string, string | undefined>;
};

export function ProductFormFields({ mode, data, errors }: ProductFormFieldsProps) {
  const { organisation: res } = useOrganisation();
  const categories = res?.data?.categories ?? [];

  const [categoryId, setCategoryId] = useState(data?.category_id ?? "");
  const [subcategoryId, setSubcategoryId] = useState(data?.subcategory_id ?? "");
  const [canExpire, setCanExpire] = useState(
    mode === "edit" ? !!data?.expiry_date : false,
  );
  const [onPromo, setOnPromo] = useState(
    mode === "edit" ? !!data?.on_promotion : false,
  );

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <ProductFormSection
        title="Product identity"
        description="Name, description and barcode for your catalog."
        icon={Package}
        accent="violet"
      >
        <Field>
          <FieldLabel htmlFor="product-name">Product name</FieldLabel>
          <Input
            id="product-name"
            name="name"
            defaultValue={data?.name}
            placeholder="e.g. Coca-Cola 500ml"
            required
            className="bg-background/80"
          />
          <FieldError errors={[{ message: errors?.name }]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="product-desc">Description</FieldLabel>
          <Textarea
            id="product-desc"
            name="desc"
            defaultValue={data?.description}
            placeholder="Short description shown on invoices and reports"
            rows={3}
            className="bg-background/80"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="product-code">Barcode / SKU</FieldLabel>
          <div className="relative">
            <Barcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="product-code"
              name="code"
              defaultValue={data?.barcode}
              placeholder="Scan or leave empty to auto-generate"
              className="bg-background/80 pl-9"
            />
          </div>
        </Field>
      </ProductFormSection>

      <ProductFormSection
        title="Classification"
        description="Organize products for filtering and reports."
        icon={FolderTree}
        accent="blue"
      >
        <input type="hidden" name="cat" value={categoryId} />
        <input type="hidden" name="subcat" value={subcategoryId} />
        <Field>
          <FieldLabel>Category</FieldLabel>
          <Select
            value={categoryId}
            onValueChange={(val) => {
              setCategoryId(val);
              setSubcategoryId("");
            }}
            required
          >
            <SelectTrigger className="w-full bg-background/80">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat: Category) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[{ message: errors?.cat }]} />
        </Field>
        {selectedCategory?.subcategories?.length ? (
          <Field>
            <FieldLabel>Subcategory</FieldLabel>
            <Select value={subcategoryId} onValueChange={setSubcategoryId}>
              <SelectTrigger className="w-full bg-background/80">
                <SelectValue placeholder="Optional subcategory" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory.subcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
      </ProductFormSection>

      <ProductFormSection
        title="Pricing"
        description="Purchase cost and selling price for margin tracking."
        icon={Tag}
        accent="emerald"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="product-purchase">Purchase price</FieldLabel>
            <Input
              id="product-purchase"
              type="number"
              name="purchase"
              min={0}
              step="0.01"
              defaultValue={data?.purchase_price}
              placeholder="0"
              required
              className="bg-background/80"
            />
            <FieldError errors={[{ message: errors?.purchase }]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-unit">Selling price</FieldLabel>
            <Input
              id="product-unit"
              type="number"
              name="unit"
              min={0}
              step="0.01"
              defaultValue={data?.unit_price}
              placeholder="0"
              required
              className="bg-background/80"
            />
            <FieldError errors={[{ message: errors?.unit }]} />
          </Field>
        </div>
      </ProductFormSection>

      <ProductFormSection
        title="Inventory"
        description="Stock on hand and low-stock alerts."
        icon={Boxes}
        accent="orange"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="product-qty">Quantity in stock</FieldLabel>
            <Input
              id="product-qty"
              type="number"
              name="qty"
              min={0}
              defaultValue={data?.quantity}
              placeholder="0"
              className="bg-background/80"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-min">Low stock threshold</FieldLabel>
            <Input
              id="product-min"
              type="number"
              name="min"
              min={0}
              defaultValue={data?.min_quantity}
              placeholder="e.g. 5"
              className="bg-background/80"
            />
            <FieldError errors={[{ message: errors?.min }]} />
          </Field>
        </div>
      </ProductFormSection>

      <ProductFormSection
        title="Expiry"
        description="For perishable goods with expiration dates."
        icon={Timer}
        accent="amber"
      >
        <Field>
          <FieldLabel htmlFor="switch-exp" className="rounded-lg border border-border/50 bg-background/60 p-3">
            <div className="flex items-center justify-between gap-4">
              <FieldContent>
                <FieldTitle className="text-sm">Product can expire</FieldTitle>
                <FieldDescription>
                  Enable for perishable inventory tracking.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="switch-exp"
                name="can-exp"
                defaultChecked={!!data?.expiry_date}
                onCheckedChange={setCanExpire}
              />
            </div>
          </FieldLabel>
        </Field>
        {canExpire && (
          <Field>
            <FieldLabel htmlFor="product-exp">Expiry date</FieldLabel>
            <DateTimePicker
              id="product-exp"
              name="exp"
              dateLabel=""
              placeholder="Pick expiry date"
              required
              value={
                data?.expiry_date ? new Date(data.expiry_date) : undefined
              }
            />
          </Field>
        )}
      </ProductFormSection>

      {mode === "add" && (
        <ProductFormSection
          title="Promotion"
          description="Limited-time discounted pricing."
          icon={Percent}
          accent="rose"
        >
          <Field>
            <FieldLabel htmlFor="switch-promo" className="rounded-lg border border-border/50 bg-background/60 p-3">
              <div className="flex items-center justify-between gap-4">
                <FieldContent>
                  <FieldTitle className="text-sm">On promotion</FieldTitle>
                  <FieldDescription>
                    Apply a promo price for a date range.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="switch-promo"
                  name="on-promo"
                  onCheckedChange={setOnPromo}
                />
              </div>
            </FieldLabel>
          </Field>
          {onPromo && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="promo-start">Start date</FieldLabel>
                  <DateTimePicker
                    id="promo-start"
                    name="promo-start"
                    dateLabel=""
                    placeholder="Start"
                    required
                  />
                  <FieldError errors={[{ message: errors?.promo_start }]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="promo-end">End date</FieldLabel>
                  <DateTimePicker
                    id="promo-end"
                    name="promo-end"
                    dateLabel=""
                    placeholder="End"
                    required
                    error={errors?.promo_end}
                  />
                  <FieldError errors={[{ message: errors?.promo_end }]} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="product-promo">Promotional price</FieldLabel>
                <Input
                  id="product-promo"
                  type="number"
                  name="promo"
                  min={0}
                  step="0.01"
                  placeholder="Lower than selling price"
                  required
                  className="bg-background/80"
                />
                <FieldError errors={[{ message: errors?.promo }]} />
              </Field>
            </div>
          )}
        </ProductFormSection>
      )}

      {mode === "add" && (
        <ProductFormSection
          title="Product image"
          description="Optional photo for catalog and POS."
          icon={ImageIcon}
          accent="cyan"
        >
          <FileUploadInput />
        </ProductFormSection>
      )}
    </div>
  );
}
