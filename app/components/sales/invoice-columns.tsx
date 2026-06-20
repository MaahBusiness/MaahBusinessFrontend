import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import type { Invoice } from "types";
import { Avatar, AvatarImage, BoringFallback } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { InvoiceTableContextMenu } from "@/components/sales/invoice-table-context-menu";
import { cn } from "@/lib/utils";
import { methods, statuses } from "@/routes/dashboard/sales/data";
import { extractImageUrl, formatDisplayAmount } from "utils";
import { Badge } from "@/components/ui/badge";
import { InvoiceTableRowActions } from "@/components/sales/invoice-table-row-actions";
import { InvoiceDetailTrigger } from "@/components/sales/invoice-receipt-dialog";

export function invoiceCols(orgId?: string): ColumnDef<Invoice>[] {
  return [
  {
    id: "select",
    accessorKey: "number",
    header: ({ table, column }) => (
      <div className="flex items-start gap-2 ">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
        <DataTableColumnHeader column={column} title="invoice N0" />
      </div>
    ),

    cell: ({ row, cell }) => {
      return (
        <InvoiceTableContextMenu {...{ cell }} className="w-[100px] ">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />

          <InvoiceDetailTrigger
            invoiceId={row.original.id}
            className="truncate hover:underline"
          >
            <span className="truncate">{row.original.number}</span>
          </InvoiceDetailTrigger>
        </InvoiceTableContextMenu>
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
      <InvoiceTableContextMenu
        className="w-[100px]"
        {...{ cell }}
        title={row.getValue("id")}
      >
        <InvoiceDetailTrigger
          invoiceId={row.original.id}
          className="truncate hover:underline"
        >
          <span className="truncate">{row.getValue("id")}</span>
        </InvoiceDetailTrigger>
      </InvoiceTableContextMenu>
    ),
    enableSorting: false,
    meta: { hidden: true },

    // enableHiding: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ cell }) => {
      const status = statuses.find(
        (status) => status.value === cell.getValue(),
      );

      return (
        <InvoiceTableContextMenu {...{ cell }}>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 font-normal",
              status?.badgeClassName,
            )}
          >
            {status?.icon && <status.icon className="size-3.5 shrink-0" />}
            {status?.label ?? String(cell.getValue())}
          </Badge>
        </InvoiceTableContextMenu>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    id: "amounts",
    accessorFn: (row) => row.total,
    header: () => (
      <div className="min-w-[168px] text-xs font-normal">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="w-8 shrink-0 text-center">Items</span>
          <span className="min-w-[72px]">Total</span>
          <span className="w-14 shrink-0 text-right">Disc.</span>
        </div>
      </div>
    ),
    cell: ({ row, cell }) => {
      const inv = row.original;
      const disc = Number(inv.total_discount || 0);

      return (
        <InvoiceTableContextMenu {...{ cell }} className="min-w-[168px]">
          <div className="flex items-center gap-3 text-sm tabular-nums">
            <span className="w-8 shrink-0 text-center text-muted-foreground">
              {inv.lines.length}
            </span>
            <span className="min-w-[72px] font-medium">
              {formatDisplayAmount(inv.total)}
            </span>
            <span
              className={cn(
                "w-14 shrink-0 text-right text-xs",
                disc > 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              {disc > 0 ? `−${formatDisplayAmount(disc)}` : "—"}
            </span>
          </div>
        </InvoiceTableContextMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    id: "client",
    accessorKey: "customer_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row, cell }) => {
      const val = row.original.customer_name ?? row.original.customer_id;
      return (
        <InvoiceTableContextMenu className="w-[160px] truncate" {...{ cell }}>
          {val && (
            <Avatar className="size-5">
              <AvatarImage src={extractImageUrl(val)} />
              <BoringFallback name={val} />
            </Avatar>
          )}
          {val ? (
            <span className="truncate">{val}</span>
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </InvoiceTableContextMenu>
      );
    },
    enableHiding: false,
  },

  {
    id: "total",
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="text-center"
        title="Total"
      />
    ),
    cell: ({ row, cell }) => (
      <InvoiceTableContextMenu {...{ cell }} className="font-medium">
        <span>{formatDisplayAmount(row.getValue("total"))}</span>
      </InvoiceTableContextMenu>
    ),
    enableSorting: false,
    meta: { hidden: true },
  },
  {
    id: "reason",
    accessorKey: "reason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reason" />
    ),
    cell: ({ row, cell }) => (
      <InvoiceTableContextMenu
        className="w-[200px] truncate"
        title={row.getValue("reason")}
        {...{ cell }}
      >
        {row.getValue("reason") ?? (
          <span className="text-muted-foreground text-normal">--</span>
        )}
      </InvoiceTableContextMenu>
    ),
    enableHiding: false,
    meta: { hidden: true },
  },
  {
    id: "paid",
    accessorKey: "advance_paid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid" />
    ),
    cell: ({ row, cell }) => {
      const amount = parseFloat(row.getValue("paid"));

      return (
        <InvoiceTableContextMenu {...{ cell }} className=" font-medium">
          <span>{formatDisplayAmount(row.getValue("paid"))}</span>
        </InvoiceTableContextMenu>
      );
    },
  },
  {
    id: "method",
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Method" />
    ),
    cell: ({ cell }) => {
      // const isActive = cell.row.original.is_active;

      const method = methods.find((method) => method.value === cell.getValue());

      return (
        <InvoiceTableContextMenu {...{ cell }}>
          {method?.icon && (
            <method.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{method?.label}</span>
        </InvoiceTableContextMenu>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "due",
    accessorKey: "remaining_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due" />
    ),
    cell: ({ row, cell }) => {
      const amount = parseFloat(row.getValue("due"));

      return (
        <InvoiceTableContextMenu
          {...{ cell }}
          className={cn(
            "font-medium",
            amount > 0 && "text-amber-700 dark:text-amber-400",
          )}
        >
          {amount ? (
            formatDisplayAmount(row.getValue("due"))
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </InvoiceTableContextMenu>
      );
    },
    enableSorting: false,
  },

  {
    id: "due-date",
    accessorKey: "due_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row, cell }) => {
      const item = row.original;
      return (
        <InvoiceTableContextMenu
          {...{ cell }}
          title={
            item.due_date &&
            new Date(item.due_date).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          }
        >
          {item.due_date ? (
            new Date(item.due_date).toLocaleDateString()
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </InvoiceTableContextMenu>
      );
    },
    enableSorting: false,
    meta: { hidden: true },
  },

  {
    id: "refund",
    accessorKey: "refund_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="To be refunded" />
    ),
    cell: ({ row, cell }) => {
      const amount = parseFloat(row.getValue("refund"));

      return (
        <InvoiceTableContextMenu {...{ cell }} className=" font-medium">
          {amount ? (
            formatDisplayAmount(row.getValue("refund"))
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </InvoiceTableContextMenu>
      );
    },
    enableSorting: false,
    meta: { hidden: true },
  },
  {
    id: "discount",
    accessorKey: "total_discount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Disc." />
    ),
    cell: ({ row, cell }) => {
      const amount = parseFloat(row.getValue("discount"));

      return (
        <InvoiceTableContextMenu {...{ cell }} className="font-medium">
          {amount ? (
            formatDisplayAmount(row.getValue("discount"))
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </InvoiceTableContextMenu>
      );
    },
    enableSorting: false,
    meta: { hidden: true },
  },

  {
    id: "tax",
    accessorKey: "tax",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tax" />
    ),
    cell: ({ row, cell }) => {
      const amount = parseFloat(row.getValue("tax"));

      return (
        <InvoiceTableContextMenu {...{ cell }} className=" font-medium">
          {amount ? (
            formatDisplayAmount(row.getValue("tax"))
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </InvoiceTableContextMenu>
      );
    },
    enableSorting: false,
    meta: { hidden: true },
  },

  {
    id: "stock",
    accessorKey: "lines",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Items"
        className="text-center"
      />
    ),
    cell: ({ row, cell }) => (
      <InvoiceTableContextMenu className="justify-center gap-2" {...{ cell }}>
        <span>{row.original.lines.length}</span>
      </InvoiceTableContextMenu>
    ),
    enableSorting: false,
    meta: { hidden: true },
  },

  {
    id: "cashier",
    accessorKey: "cashier_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cashier" />
    ),
    cell: ({ row, cell }) => {
      const val = row.original.cashier_name ?? row.original.cashier_id;
      return (
        <InvoiceTableContextMenu className="w-[200px] truncate" {...{ cell }}>
          {val && (
            <Avatar className="size-5">
              <AvatarImage src={extractImageUrl(val)} />
              <BoringFallback name={val} />
            </Avatar>
          )}
          {val ? (
            <span className="truncate">{val}</span>
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </InvoiceTableContextMenu>
      );
    },
    enableHiding: false,
    meta: { hidden: true },
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
        <InvoiceTableContextMenu
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
        </InvoiceTableContextMenu>
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
        <InvoiceTableContextMenu
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
        </InvoiceTableContextMenu>
      );
    },
    meta: { hidden: true },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <InvoiceTableRowActions row={row} />,
    enableHiding: false,
  },
];
}
