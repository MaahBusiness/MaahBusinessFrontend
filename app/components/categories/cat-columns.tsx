import type { ColumnDef, RowData } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import type { Category, Subcategory } from "types";
import { CatTableRowActions } from "@/components/categories/cat-table-row-actions";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { CatTableContextMenu } from "@/components/categories/cat-table-context-menu";

export const catCols: ColumnDef<Category>[] = [
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
        <div className="flex flex-row items-center gap-2 px-4">
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
    cell: ({ cell }) => {
      return (
        <CatTableContextMenu
          className="max-w-[500px] "
          title={`${cell.getValue()}`}
          {...{ cell }}
        >
          <Link to={`${cell.row.original.id}`} className="hover:underline">
            <span className="truncate">{`${cell.getValue()}`}</span>
          </Link>
        </CatTableContextMenu>
      );
    },
    enableHiding: false,
  },
  {
    id: "desc",
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ cell }) => (
      <CatTableContextMenu className="max-w-[500px] " {...{ cell }}>
        <span className="truncate">{`${cell.getValue()}`}</span>
      </CatTableContextMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "subs",
    accessorKey: "subcategories",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Subcategories"
        className="text-center"
      />
    ),
    cell: ({ row, cell }) => {
      const subs = row.getValue("subs") as Subcategory[] | undefined;
      return (
        <CatTableContextMenu {...{ cell }} className="text-center">
          {subs?.length && subs.length > 0 ? (
            <Link to={`${row.original.id}`} className="hover:underline">
              <Button size={"sm"} className="text-xxs" variant={"outline"}>
                {subs?.length} subcategories
              </Button>
            </Link>
          ) : (
            "--"
          )}
        </CatTableContextMenu>
      );
    },
  },
  {
    id: "updated",
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row, cell }) => {
      const date = row.getValue("updated") as string | undefined;
      if (date)
        return (
          <CatTableContextMenu
            {...{ cell }}
            title={new Date(date).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          >
            {new Date(date).toLocaleDateString("en", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </CatTableContextMenu>
        );
      else return null;
    },
    meta: { hidden: true, sort: true },
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <div className=" w-full flex items-center justify-end">
        <CatTableRowActions row={row} />
      </div>
    ),
  },
];
