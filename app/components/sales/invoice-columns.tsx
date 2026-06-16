import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import type { Invoice } from "types";
import { Avatar, AvatarImage, BoringFallback } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { InvoiceTableContextMenu } from "@/components/sales/invoice-table-context-menu";
import { cn } from "@/lib/utils";
import { methods, statuses } from "@/routes/dashboard/sales/data";
import { extractImageUrl, formatDisplayAmount } from "utils";
import { InvoiceTableRowActions } from "@/components/sales/invoice-table-row-actions";
import { Link } from "react-router";

export const invoiceCols: ColumnDef<Invoice>[] = [
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

          <Link
            to={`../invoices/${row.original.id}`}
            className="hover:underline"
          >
            <span className="truncate">{row.original.number}</span>
          </Link>
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
        <Link to={`../invoices/${row.original.id}`} className="hover:underline">
          <span className="truncate">{row.getValue("id")}</span>
        </Link>
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
          {status?.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span className={status?.className}>{status?.label}</span>
          {/* <Badge variant="outline" className={className}>
            {capitalizeFirstChar(`${cell.getValue()}`)}
          </Badge> */}
        </InvoiceTableContextMenu>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    id: "total",
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="text-center"
        title="Total Amount"
      />
    ),
    cell: ({ row, cell }) => {
      const amount = parseFloat(row.getValue("total"));

      return (
        <InvoiceTableContextMenu {...{ cell }} className=" font-medium">
          <span>{formatDisplayAmount(row.getValue("total"))}</span>
        </InvoiceTableContextMenu>
      );
    },
    enableSorting: false,
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
  },
  {
    id: "paid",
    accessorKey: "advance_paid",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className=" "
        title="Amount Paid"
      />
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
      <DataTableColumnHeader column={column} title="Payment Method" />
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
      <DataTableColumnHeader column={column} title="Amount Due" />
    ),
    cell: ({ row, cell }) => {
      const amount = parseFloat(row.getValue("due"));

      return (
        <InvoiceTableContextMenu
          {...{ cell }}
          className={cn(
            " font-medium",
            amount && amount < 0 && "text-destructive",
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
  },
  {
    id: "discount",
    accessorKey: "total_discount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Discount" />
    ),
    cell: ({ row, cell }) => {
      const amount = parseFloat(row.getValue("discount"));

      return (
        <InvoiceTableContextMenu {...{ cell }} className=" font-medium">
          {amount ? (
            formatDisplayAmount(row.getValue("discount"))
          ) : (
            <span className="text-muted-foreground text-normal">--</span>
          )}
        </InvoiceTableContextMenu>
      );
    },
    enableSorting: false,
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
  },

  {
    id: "stock",
    accessorKey: "lines",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="N0 of items"
        className="text-center"
      />
    ),
    cell: ({ row, cell }) => (
      <InvoiceTableContextMenu className="gap-2 justify-center" {...{ cell }}>
        <span className="max-w-[400px] truncate ">
          {row.original.lines.length}
        </span>
      </InvoiceTableContextMenu>
    ),
    enableSorting: false,
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
    meta: { sort: true },
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
    cell: ({ row }) => <InvoiceTableRowActions row={row} />,
  },
];
