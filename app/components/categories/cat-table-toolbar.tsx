import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { hasPermission } from "utils/permissions";
import { useOrganisation } from "@/hooks/use-organisation";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { visibles } from "@/routes/dashboard/products/data";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function CatTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { businessMember } = useOrganisation();

  return (
    <div className="flex items-center justify-between ">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter categories..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[250px] lg:w-[600px]"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Clear
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} options={visibles} />
        {hasPermission(businessMember?.role, "products:crud") && (
          <CategoryFormDialog variant="outline" />
        )}
      </div>
    </div>
  );
}
