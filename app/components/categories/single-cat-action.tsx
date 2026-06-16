import type { Category, Subcategory } from "types";
import { CategoryItemActions } from "@/components/categories/category-item-actions";

export function SingleCatActions({ data }: { data: Category | Subcategory }) {
  return <CategoryItemActions data={data} />;
}
