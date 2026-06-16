import {
  BadgeCheckIcon,
  Barcode,
  Boxes,
  Calendar,
  Check,
  Copy,
  FolderTree,
  Layers,
  Package,
  Tag,
  TrendingDown,
  X,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category, Product, Subcategory } from "types";
import {
  formatDisplayAmount,
  getTimeUntilOrSince,
  isEarlier,
  isLater,
} from "utils";
import { cn } from "@/lib/utils";
import { ProductStatsGrid } from "@/components/products/product-stats-grid";

function isPromoActive(product: Product) {
  if (!product.on_promotion) return false;
  const today = new Date(Date.now()).toDateString();
  return (
    !isEarlier(today, product.promotion_start_date) &&
    !isLater(today, product.promotion_end_date)
  );
}

function DetailSection({
  title,
  description,
  icon: Icon,
  accent,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "violet" | "blue" | "emerald" | "orange" | "amber" | "rose";
  children: React.ReactNode;
  className?: string;
}) {
  const borders = {
    violet: "border-violet-500/20",
    blue: "border-blue-500/20",
    emerald: "border-emerald-500/20",
    orange: "border-orange-500/20",
    amber: "border-amber-500/20",
    rose: "border-rose-500/20",
  };
  const bgs = {
    violet: "bg-violet-500/5",
    blue: "bg-blue-500/5",
    emerald: "bg-emerald-500/5",
    orange: "bg-orange-500/5",
    amber: "bg-amber-500/5",
    rose: "bg-rose-500/5",
  };
  const icons = {
    violet: "text-violet-600 bg-violet-500/15",
    blue: "text-blue-600 bg-blue-500/15",
    emerald: "text-emerald-600 bg-emerald-500/15",
    orange: "text-orange-600 bg-orange-500/15",
    amber: "text-amber-600 bg-amber-500/15",
    rose: "text-rose-600 bg-rose-500/15",
  };

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm",
        borders[accent],
        bgs[accent],
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/40 bg-card/50 px-4 py-3 sm:px-5">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            icons[accent],
          )}
        >
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function CopyField({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="relative flex items-center">
        <code className="flex-1 truncate rounded-lg border border-border/60 bg-background/80 px-3 py-2 font-mono text-xs">
          {value}
        </code>
        <Button
          type="button"
          onClick={onCopy}
          variant="secondary"
          size="icon-sm"
          className="absolute right-1 size-7 shrink-0"
          title={`Copy ${label}`}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </Button>
      </div>
    </div>
  );
}

function CategoryPathDisplay({
  category,
  subcategory,
}: {
  category?: Category;
  subcategory?: Subcategory;
}) {
  if (!category) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
        This product is not assigned to a category yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex min-w-0 items-center gap-2 rounded-md border border-violet-500/20 border-l-[3px] border-l-violet-500 bg-violet-500/[0.06] px-3 py-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-violet-500/15">
          <FolderTree className="size-3.5 text-violet-600 dark:text-violet-400" />
        </div>
        <Badge
          variant="outline"
          className="h-4 shrink-0 border-violet-500/35 px-1 text-[9px] text-violet-700 dark:text-violet-300"
        >
          Cat
        </Badge>
        <Link
          to={`../products/categories/${category.id}`}
          relative="route"
          className="min-w-0 truncate text-sm font-semibold hover:text-violet-600"
          title={category.description || category.name}
        >
          {category.name}
        </Link>
        {category.description && (
          <span className="hidden min-w-0 truncate text-xs text-muted-foreground tablet:inline">
            — {category.description}
          </span>
        )}
      </div>

      {subcategory ? (
        <div className="ml-4 flex min-w-0 items-center gap-2 rounded-md border border-teal-500/20 bg-teal-500/5 px-3 py-2 sm:ml-6">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-teal-500/15">
            <Layers className="size-3 text-teal-600 dark:text-teal-400" />
          </div>
          <Badge
            variant="outline"
            className="h-4 shrink-0 border-teal-500/30 px-1 text-[9px] text-teal-700 dark:text-teal-300"
          >
            Sub
          </Badge>
          <Link
            to={`../products/categories/${category.id}/${subcategory.id}`}
            className="min-w-0 truncate text-sm font-medium hover:text-teal-600"
            title={subcategory.description || subcategory.name}
          >
            {subcategory.name}
          </Link>
        </div>
      ) : (
        <p className="ml-4 text-xs text-muted-foreground sm:ml-6">
          No subcategory assigned
        </p>
      )}
    </div>
  );
}

function BarcodeDisplay({
  product,
  onCopy,
  copied,
}: {
  product: Product;
  onCopy: (text: string) => void;
  copied: boolean;
}) {
  if (!product.barcode) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Barcode / SKU
        </p>
        <p className="mt-1 text-sm text-muted-foreground">No barcode assigned</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <CopyField
        label="Barcode / SKU"
        value={product.barcode}
        onCopy={() => onCopy(product.barcode!)}
        copied={copied}
      />
      {product.barcode_image_url && (
        <div className="overflow-hidden rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-orange-600">
            Scannable code
          </p>
          <img
            src={product.barcode_image_url}
            alt={`Barcode for ${product.name}`}
            className="mx-auto h-20 w-full max-w-sm object-contain"
          />
        </div>
      )}
    </div>
  );
}

export function SingleProductDetails({
  product,
  category,
  subcategory,
  onCopy,
  copiedField,
}: {
  product: Product;
  category?: Category;
  subcategory?: Subcategory;
  onCopy: (text: string) => void;
  copiedField: "barcode" | null;
}) {
  const promoActive = isPromoActive(product);
  const margin =
    product.unit_price > 0
      ? (
          ((product.unit_price - product.purchase_price) / product.unit_price) *
          100
        ).toFixed(0)
      : "0";

  return (
    <div className="min-w-0 space-y-5 tablet:space-y-6">
      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        {product.is_low_stock && (
          <Badge
            variant="outline"
            className="border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300"
          >
            <TrendingDown className="mr-1 size-3" />
            Low stock
          </Badge>
        )}
        {promoActive && (
          <Badge
            variant="outline"
            className="border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          >
            <BadgeCheckIcon className="mr-1 size-3" />
            On promotion
          </Badge>
        )}
        {product.is_expired && (
          <Badge variant="destructive">Expired</Badge>
        )}
        {!product.is_low_stock && !promoActive && !product.is_expired && (
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          >
            Active in catalog
          </Badge>
        )}
      </div>

      {/* KPI strip */}
      <ProductStatsGrid
        items={[
          {
            label: "In stock",
            value: formatDisplayAmount(`${product.quantity}`),
            accent: "violet",
            icon: Package,
            hint:
              product.min_quantity > 0
                ? `Alert below ${product.min_quantity}`
                : undefined,
          },
          {
            label: "Selling price",
            value: formatDisplayAmount(`${product.unit_price}`),
            accent: "emerald",
            icon: Tag,
          },
          {
            label: "Purchase cost",
            value: formatDisplayAmount(`${product.purchase_price}`),
            accent: "orange",
            icon: Boxes,
            hint: `${margin}% margin`,
          },
          {
            label: "Stock value",
            value: formatDisplayAmount(
              `${Number(product.unit_price) * Number(product.quantity || 0)}`,
            ),
            accent: "rose",
            icon: Barcode,
          },
        ]}
      />

      <div className="grid min-w-0 gap-5 desktop:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] desktop:gap-6">
        <div className="min-w-0 space-y-5">
          {/* Hero: image + identity */}
          <div className="min-w-0 overflow-hidden rounded-xl border border-violet-500/15 bg-card/80 shadow-sm backdrop-blur-sm">
            <div className="grid min-w-0 gap-0 tablet:grid-cols-2">
              <div className="relative aspect-square max-h-64 bg-muted/30 tablet:aspect-auto tablet:max-h-none tablet:min-h-[200px]">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Package className="size-10 opacity-40" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 p-4 sm:p-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">
                    Product identity
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {product.description || "No description provided."}
                  </p>
                </div>
                <BarcodeDisplay
                  product={product}
                  onCopy={onCopy}
                  copied={copiedField === "barcode"}
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <DetailSection
            title="Classification"
            description="Where this product lives in your catalog"
            icon={FolderTree}
            accent="blue"
          >
            <CategoryPathDisplay category={category} subcategory={subcategory} />
          </DetailSection>

          {/* Pricing */}
          <DetailSection
            title="Pricing"
            description="Cost, retail price and promotions"
            icon={Tag}
            accent="emerald"
          >
            {promoActive && product.promo_price != null && (
              <div className="mb-4 rounded-lg border border-rose-500/25 bg-rose-500/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-300">
                      <BadgeCheckIcon className="size-4" />
                      Active promotion
                      <span className="text-xs font-normal text-muted-foreground">
                        ({getTimeUntilOrSince(product.promotion_end_date!)})
                      </span>
                    </p>
                    <p className="mt-2 truncate text-xl font-bold tabular-nums tablet:text-2xl">
                      {formatDisplayAmount(`${product.promo_price}`)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground line-through">
                      {formatDisplayAmount(`${product.unit_price}`)}
                      {" · "}
                      {(
                        ((product.unit_price - product.promo_price) /
                          product.unit_price) *
                        100
                      ).toFixed(0)}
                      % off
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      From{" "}
                      {new Date(product.promotion_start_date!).toLocaleDateString(
                        "en",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </p>
                    <p>
                      To{" "}
                      {new Date(product.promotion_end_date!).toLocaleDateString(
                        "en",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid min-w-0 gap-4 min-[480px]:grid-cols-2">
              <div className="min-w-0 rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Purchase price
                </p>
                <p className="mt-1 truncate font-mono text-base font-semibold tablet:text-lg">
                  {formatDisplayAmount(`${product.purchase_price}`)}
                </p>
                <p className="text-xs text-muted-foreground">Cost per unit</p>
              </div>
              <div className="min-w-0 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-[10px] font-semibold uppercase text-emerald-600">
                  Selling price
                </p>
                <p className="mt-1 truncate font-mono text-base font-semibold tablet:text-lg">
                  {formatDisplayAmount(`${product.unit_price}`)}
                </p>
                <p className="text-xs text-muted-foreground">Retail (MSRP)</p>
              </div>
            </div>
          </DetailSection>

          {/* Inventory */}
          <DetailSection
            title="Inventory"
            description="Stock on hand and low-stock alerts"
            icon={Boxes}
            accent="orange"
          >
            <div className="grid min-w-0 gap-4 min-[480px]:grid-cols-2">
              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Quantity
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {product.quantity}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Low stock threshold
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {product.min_quantity}
                </p>
              </div>
            </div>
          </DetailSection>
        </div>

        {/* Sidebar timeline */}
        <aside className="min-w-0 space-y-5 desktop:sticky desktop:top-[calc(var(--header-height)+1rem)] desktop:self-start">
          <DetailSection
            title="Timeline"
            description="Key dates"
            icon={Calendar}
            accent="amber"
          >
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between gap-2 border-b border-border/40 pb-3">
                <span className="text-muted-foreground">Created</span>
                <span className="text-right font-medium">
                  {new Date(product.created_at).toLocaleDateString("en", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
              <li className="flex justify-between gap-2 border-b border-border/40 pb-3">
                <span className="text-muted-foreground">Last updated</span>
                <span className="text-right font-medium">
                  {new Date(product.updated_at).toLocaleDateString("en", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground">Expiry</span>
                <span
                  className={cn(
                    "text-right font-medium",
                    product.is_expired && "text-destructive",
                  )}
                >
                  {product.expiry_date ? (
                    new Date(product.expiry_date).toLocaleDateString("en", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
              </li>
              {product.on_promotion && !promoActive && (
                <li className="flex justify-between gap-2 pt-2 text-xs text-muted-foreground">
                  <span>Promotion</span>
                  <span className="flex items-center gap-1">
                    <X className="size-3" /> Not active
                  </span>
                </li>
              )}
            </ul>
          </DetailSection>
        </aside>
      </div>
    </div>
  );
}
