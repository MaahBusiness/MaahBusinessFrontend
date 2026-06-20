import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PickerDropdown } from "@/components/sales/picker-dropdown";
import { useOrganisation } from "@/hooks/use-organisation";
import { cn } from "@/lib/utils";
import { ChevronDown, PackageSearch, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "types";
import { formatDisplayAmount } from "utils";

const PAGE_SIZE = 15;

export function PosProductPicker({
  onAdd,
  defaultQty = 1,
  className,
}: {
  onAdd: (products: Product[]) => void;
  defaultQty?: number;
  className?: string;
}) {
  const { fetchProducts } = useOrganisation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map<string, Product>>(
    new Map(),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
      setPage(1);
      setItems([]);
      setSelectedMap(new Map());
    }
  }, [open]);

  const searchFilter = debounced.length >= 2 ? { search: debounced } : {};

  const { data: res, isFetching } = fetchProducts(
    { page, page_size: PAGE_SIZE, ...searchFilter },
    { enabled: open },
  );

  useEffect(() => {
    if (!open || !res?.success || !res.data) return;
    if (page === 1) {
      setItems(res.data);
      return;
    }
    setItems((prev) => {
      const known = new Set(prev.map((p) => p.id));
      const next = res.data!.filter((p) => !known.has(p.id));
      return next.length ? [...prev, ...next] : prev;
    });
  }, [open, res?.data, res?.success, page]);

  const meta = res?.meta;
  const hasMore = meta ? meta.current_page < meta.total_pages : false;
  const selectedCount = selectedMap.size;

  const toggleProduct = (product: Product, checked: boolean) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (checked) next.set(product.id, product);
      else next.delete(product.id);
      return next;
    });
  };

  const handleAdd = () => {
    if (!selectedCount) return;
    onAdd(Array.from(selectedMap.values()));
    setOpen(false);
  };

  const listHint = useMemo(() => {
    if (debounced.length >= 2) return `Results for "${debounced}"`;
    if (meta?.count != null) return `${meta.count} products · search to filter`;
    return "Browse or search the catalog";
  }, [debounced, meta?.count]);

  return (
    <PickerDropdown
      open={open}
      onOpenChange={setOpen}
      className={className}
      minWidth={380}
      trigger={
        <Button
          type="button"
          variant="outline"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "h-9 w-full justify-between font-normal sm:min-w-[220px]",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <PackageSearch className="size-4 shrink-0 text-muted-foreground" />
            Select products
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 opacity-50 transition-transform",
              open && "rotate-180",
            )}
          />
        </Button>
      }
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="shrink-0 border-b border-border p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or barcode…"
              className="h-8 pl-8"
            />
          </div>
          <p className="mt-1.5 px-0.5 text-[11px] text-muted-foreground">
            {listHint}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-1">
          {isFetching && page === 1 ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !res?.success && !isFetching ? (
            <p className="py-6 text-center text-sm text-destructive">
              {res?.message ?? "Could not load products."}
            </p>
          ) : items.length === 0 ? (
            <Empty className="border-0 py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageSearch className="size-4" />
                </EmptyMedia>
                <EmptyTitle>No products found</EmptyTitle>
                <EmptyDescription>
                  {debounced.length >= 2
                    ? "Try another search term."
                    : "No products in catalog."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {items.map((product) => {
                const checked = selectedMap.has(product.id);
                const inputId = `product-pick-${product.id}`;
                return (
                  <Label
                    key={product.id}
                    htmlFor={inputId}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent",
                      checked && "bg-violet-500/10",
                    )}
                  >
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleProduct(product, value === true)
                      }
                    />
                    <Avatar className="size-7 shrink-0">
                      <BoringFallback name={product.name} />
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Stock {product.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatDisplayAmount(product.unit_price)}
                    </span>
                  </Label>
                );
              })}
              {hasMore && (
                <div className="px-1 py-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-full text-xs"
                    disabled={isFetching && page > 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {isFetching && page > 1 ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      `Load more (${items.length}/${meta?.count ?? "…"})`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-2 py-2">
          <span className="text-[11px] text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} selected · qty ${defaultQty}`
              : "Check items to add"}
          </span>
          <Button
            type="button"
            size="sm"
            className="h-8 auth-submit-btn border-0"
            disabled={!selectedCount}
            onClick={handleAdd}
          >
            Add ({selectedCount})
          </Button>
        </div>
      </div>
    </PickerDropdown>
  );
}

/** @deprecated Use PosProductPicker */
export const PosProductSearchDialog = PosProductPicker;
