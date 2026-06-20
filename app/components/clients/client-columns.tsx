import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import type { Client } from "types";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatDisplayAmount } from "utils";
import { cn } from "@/lib/utils";
import { types } from "@/routes/dashboard/clients/data";
import { ClientTableContextMenu } from "@/components/clients/client-table-context-menu";
import { ClientTableRowActions } from "@/components/clients/client-table-row-actions";
import { ClientNameCell } from "@/components/clients/client-name-cell";

export const clientCols: ColumnDef<Client>[] = [
  {
    id: "select",
    header: ({ table, column }) => (
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

    cell: ({ row, cell }) => {
      return (
        <div className="flex flex-row items-center gap-2 px-4">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "id",
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row, cell }) => (
      <ClientTableContextMenu
        className="w-[120px]"
        {...{ cell }}
        title={row.getValue("id")}
      >
        <span className="truncate">{row.getValue("id")}</span>
      </ClientTableContextMenu>
    ),
    enableSorting: false,
    meta: { hidden: true },

    // enableHiding: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row, cell }) => (
      <ClientTableContextMenu
        className="w-[200px] truncate"
        title={row.getValue("name")}
        {...{ cell }}
      >
        <ClientNameCell client={row.original} />
      </ClientTableContextMenu>
    ),
    enableHiding: false,
  },
  {
    id: "type",
    accessorKey: "customer_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ cell }) => {
      const type = types.find((type) => type.value === cell.getValue());

      return (
        <ClientTableContextMenu {...{ cell }}>
          {type?.icon && (
            <type.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{type?.label}</span>
        </ClientTableContextMenu>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ cell }) => (
      <ClientTableContextMenu {...{ cell }}>
        <span>
          {cell.getValue() ? (
            `${cell.getValue()}`
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </span>
      </ClientTableContextMenu>
    ),
    enableSorting: false,
  },
  {
    id: "phone",
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ cell }) => (
      <ClientTableContextMenu {...{ cell }}>
        <span>
          {cell.getValue() ? (
            `${cell.getValue()}`
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </span>
      </ClientTableContextMenu>
    ),
    enableSorting: false,
  },
  {
    id: "address",
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ cell }) => (
      <ClientTableContextMenu
        className="max-w-[200px]"
        title={`${cell.getValue()}`}
        {...{ cell }}
      >
        {cell.getValue() ? (
          <span className="truncate">{`${cell.getValue()}`}</span>
        ) : (
          <span className="text-muted-foreground text-normal">--</span>
        )}
      </ClientTableContextMenu>
    ),
    enableSorting: false,
  },

  {
    id: "total",
    accessorKey: "total_purchases",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="text-center"
        title="Total spent"
      />
    ),
    cell: ({ row, cell }) => {
      const amount = Number(row.original.total_purchases ?? 0);

      return (
        <ClientTableContextMenu
          {...{ cell }}
          className={cn(
            "font-medium",
            amount > 0 && "text-emerald-700 dark:text-emerald-400",
          )}
        >
          <span>{formatDisplayAmount(amount)}</span>
        </ClientTableContextMenu>
      );
    },
    enableSorting: false,
  },
  {
    id: "points",
    accessorKey: "loyalty_points",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="text-center"
        title="Loyalty points"
      />
    ),
    cell: ({ row, cell }) => {
      return (
        <ClientTableContextMenu {...{ cell }} className=" font-medium">
          <span>{`${cell.getValue()}`}</span>
        </ClientTableContextMenu>
      );
    },
    enableSorting: false,
  },

  {
    id: "updated",
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row, cell }) => {
      const item = row.original;
      return (
        <ClientTableContextMenu
          {...{ cell }}
          title={new Date(item.updated_at).toLocaleString("en", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        >
          {new Date(item.updated_at).toLocaleDateString()}
        </ClientTableContextMenu>
      );
    },
    meta: { sort: true, hidden: true },
  },
  {
    id: "created",
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Created" />
    ),
    cell: ({ row, cell }) => {
      const item = row.original;
      return (
        <ClientTableContextMenu
          {...{ cell }}
          title={new Date(item.created_at).toLocaleString("en", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        >
          {new Date(item.created_at).toLocaleDateString()}
        </ClientTableContextMenu>
      );
    },
    meta: { hidden: true },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ClientTableRowActions row={row} />,
    enableHiding: false,
  },
];
