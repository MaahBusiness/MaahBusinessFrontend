import { Avatar, BoringFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useOrganisation } from "@/hooks/use-organisation";
import { PackageSearch, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "types";
import { formatDisplayAmount } from "utils";

export function PosProductSearchDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
}) {
  const { fetchProducts } = useOrganisation();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
    }
  }, [open]);

  const { data: res, isFetching } = fetchProducts(
    { search: debounced || undefined, page_size: 20 },
    { enabled: open },
  );

  const products = res?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-violet-500/15 bg-gradient-to-r from-violet-500/10 via-card to-blue-500/5 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <PackageSearch className="size-4 text-violet-600" />
            Search products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or barcode…"
              className="pl-9"
            />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {isFetching ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : !res?.success ? (
              <p className="py-8 text-center text-sm text-destructive">
                {res?.message ?? "Could not load products."}
              </p>
            ) : products.length === 0 ? (
              <Empty className="border-0 py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PackageSearch className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>No products found</EmptyTitle>
                  <EmptyDescription>
                    {debounced
                      ? "Try another search term or scan the barcode."
                      : "No products in catalog yet."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    onSelect(product);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-violet-500/20 hover:bg-violet-500/5"
                >
                  <Avatar className="size-9 shrink-0">
                    <BoringFallback name={product.name} />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock {product.quantity}
                      {product.barcode ? ` · ${product.barcode}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatDisplayAmount(product.unit_price)}
                  </span>
                </button>
              ))
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
