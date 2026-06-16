import type { Row } from "@tanstack/react-table";
import type { Product } from "types";
import { ProductItemActions } from "@/components/products/product-item-actions";

export function ProductTableRowActions({ row }: { row: Row<Product> }) {
  return (
    <div className="flex h-9 items-center px-1">
      <ProductItemActions product={row.original} compact />
    </div>
  );
}
