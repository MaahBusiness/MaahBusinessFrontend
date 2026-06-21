import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { format, parseISO } from "date-fns";
import type { Expense } from "@/lib/finance-types";
import {
  EXPENSE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/routes/dashboard/expenses/data";
import { ExpenseItemActions } from "@/components/expenses/expense-item-actions";
import { formatDisplayAmount } from "utils";
import { cn } from "@/lib/utils";

export const expenseCols: ColumnDef<Expense>[] = [
  {
    id: "reason",
    accessorKey: "reason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reason" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[220px]">
        <p className="truncate font-medium">{row.original.reason}</p>
        {row.original.reason_details && (
          <p className="truncate text-xs text-muted-foreground">
            {row.original.reason_details}
          </p>
        )}
      </div>
    ),
  },
  {
    id: "expense_type",
    accessorKey: "expense_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {EXPENSE_TYPE_LABELS[row.original.expense_type]}
      </Badge>
    ),
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-orange-700 dark:text-orange-300">
        {formatDisplayAmount(row.original.amount)}
      </span>
    ),
  },
  {
    id: "payee_name",
    accessorKey: "payee_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payee" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[140px]">
        <p className="truncate">{row.original.payee_name}</p>
        <p className="text-xs capitalize text-muted-foreground">
          {row.original.payee_type.replace(/_/g, " ").toLowerCase()}
        </p>
      </div>
    ),
  },
  {
    id: "payment_method",
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => PAYMENT_METHOD_LABELS[row.original.payment_method],
  },
  {
    id: "is_approved",
    accessorKey: "is_approved",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge
        className={cn(
          "font-medium",
          row.original.is_approved
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        )}
      >
        {row.original.is_approved ? "Approved" : "Pending"}
      </Badge>
    ),
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(parseISO(row.original.created_at), "MMM d, yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ExpenseItemActions expense={row.original} compact />,
    enableSorting: false,
    enableHiding: false,
  },
];
