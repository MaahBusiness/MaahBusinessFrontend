import type { Product } from "types";
import { ProductItemActions } from "@/components/products/product-item-actions";

export function SingleProductActions({ data }: { data: Product }) {
  return <ProductItemActions product={data} hideView />;
}
