import type { Row } from "@tanstack/react-table";
import type { Product } from "types";
import { ProductItemActions } from "@/components/products/product-item-actions";

export function ProductTableRowActions({ row }: { row: Row<Product> }) {
  return <ProductItemActions product={row.original} compact />;
}
