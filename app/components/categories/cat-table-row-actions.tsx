import type { Row } from "@tanstack/react-table";
import type { Category, Subcategory } from "types";
import { CategoryItemActions } from "@/components/categories/category-item-actions";

interface DataTableRowActionsProps {
  row?: Row<Category | Subcategory>;
  data?: Category | Subcategory;
}

export function CatTableRowActions({ row, data: dataProp }: DataTableRowActionsProps) {
  const data = dataProp ?? row?.original;
  if (!data) return null;

  return <CategoryItemActions data={data} compact />;
}
