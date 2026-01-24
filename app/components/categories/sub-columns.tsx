import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import type { Subcategory } from "types";
import { DataTableRowActions } from "@/components/categories/cat-table-row-actions";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export const subCatCols: ColumnDef<Subcategory>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-row items-center gap-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <span className="max-w-[500px] truncate ">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    id: "desc",
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        {row.getValue("desc") ? (
          <span
            title={row.getValue("desc")}
            className="max-w-[600px] truncate "
          >
            {row.getValue("desc")}
          </span>
        ) : (
          <span className="text-muted-foreground ">No description</span>
        )}
      </div>
    ),
    enableHiding: false,
  },
  {
    id: "updated",
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("updated") as string | undefined;
      if (date)
        return (
          <span
            title={new Date(date).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          >
            {new Date(date).toLocaleDateString()}
          </span>
        );
      else return null;
    },
    meta: { hidden: true, sort: true },
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <div className=" w-full flex items-center justify-end">
        <DataTableRowActions row={row} />
      </div>
    ),
  },
];
