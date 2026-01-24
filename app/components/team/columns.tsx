import type { ColumnDef, RowData } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import type { OrganisationMember } from "types";
import { Avatar, BoringFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DataTableRowActions } from "@/components/team/data-table-row-actions";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { roles } from "@/routes/dashboard/team/data";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    hidden?: boolean;
    sort?: boolean;
  }
}

export const columns = (user_id: string): ColumnDef<OrganisationMember>[] => [
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
      const user = row.original.user;

      return (
        <div className="flex flex-row items-center gap-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />

          <Avatar className="size-6">
            <AvatarImage src={user?.avatar_url} />
            <BoringFallback name={user?.name} />
          </Avatar>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "id",
    accessorKey: "user.id",
    // accessorFn: (row) => row.user?.id ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] truncate">{row.getValue("id")}</div>
    ),
    enableSorting: false,
    meta: { hidden: true },

    // enableHiding: false,
  },
  {
    id: "name",
    accessorKey: "user.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const isYou = row.original.user?.id === user_id;

      return (
        <div className="flex gap-2 items-center">
          <span className="max-w-[500px] truncate ">
            {row.getValue("name")}
          </span>
          {isYou && (
            <Badge
              className="text-xxs h-5 min-w-5 tabular-nums capitalize"
              variant="secondary"
            >
              {"You"}
            </Badge>
          )}
        </div>
      );
    },
    enableHiding: false,
  },
  { id: "email", accessorKey: "user.email", header: "Email" },
  {
    id: "phone",
    accessorKey: "user.phone_number",
    header: "Phone",
    cell: ({ row }) => row.getValue("phone") || null,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = roles.find((r) => r.id === row.original.role);

      return (
        <div className="flex gap-2">
          <span className="max-w-[500px] truncate ">{role?.label}</span>
          {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.is_active;

      return (
        <Badge
          variant="outline"
          className={cn(isActive ? "" : "bg-warning text-foreground")}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "joined",
    accessorKey: "joined_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined at" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("joined") as string | undefined;
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
    id: "left",
    accessorKey: "left_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Left at" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("left") as string | undefined;
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
    meta: { hidden: true },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
