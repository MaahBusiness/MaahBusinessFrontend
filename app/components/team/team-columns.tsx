import type { ColumnDef, RowData } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import type { OrganisationMember } from "types";
import { Avatar, BoringFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TeamTableRowActions } from "@/components/team/team-table-row-actions";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { roles } from "@/routes/dashboard/team/data";
import { TeamTableContextMenu } from "@/components/team/team-table-context-menu";

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
        <div className="flex flex-row items-center gap-2 px-4">
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row, cell }) => (
      <TeamTableContextMenu
        title={row.getValue("id")}
        className="w-32"
        {...{ cell }}
      >
        <span className="truncate">{row.getValue("id")}</span>
      </TeamTableContextMenu>
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
    cell: ({ row, cell }) => {
      const isYou = row.original.user?.id === user_id;

      return (
        <TeamTableContextMenu
          className="w-[200px] "
          title={row.getValue("name")}
          {...{ cell }}
        >
          <span className="truncate">{row.getValue("name")}</span>
          {isYou && (
            <Badge
              className="text-xxs h-5 min-w-5 tabular-nums capitalize"
              variant="secondary"
            >
              {"You"}
            </Badge>
          )}
        </TeamTableContextMenu>
      );
    },
    enableHiding: false,
  },
  {
    id: "email",
    accessorKey: "user.email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ cell }) => (
      <TeamTableContextMenu {...{ cell }} className="text-right ">
        <span>{`${cell.getValue()}`}</span>
      </TeamTableContextMenu>
    ),
    enableSorting: false,
  },
  {
    id: "phone",
    accessorKey: "user.phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ cell }) => (
      <TeamTableContextMenu {...{ cell }} className="text-right ">
        <span>{`${cell.getValue() ?? "--"}`}</span>
      </TeamTableContextMenu>
    ),
    enableSorting: false,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ cell }) => {
      const role = roles.find((r) => r.id === cell.row.original.role);

      return (
        <TeamTableContextMenu {...{ cell }}>{role?.label}</TeamTableContextMenu>
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
    cell: ({ cell }) => {
      const isActive = cell.row.original.is_active;

      return (
        <TeamTableContextMenu {...{ cell }}>
          <Badge
            variant="outline"
            className={cn(
              isActive ? "" : "text-destructive border-destructive",
            )}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </TeamTableContextMenu>
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
    cell: ({ row, cell }) => {
      const date = row.getValue("joined") as string | undefined;
      if (date)
        return (
          <TeamTableContextMenu
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
          </TeamTableContextMenu>
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
    cell: ({ row, cell }) => {
      const date = row.getValue("left") as string | undefined;
      if (date)
        return (
          <TeamTableContextMenu
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
          </TeamTableContextMenu>
        );
      else return null;
    },
    meta: { hidden: true },
  },
  {
    id: "actions",
    cell: ({ row }) => <TeamTableRowActions row={row} />,
  },
];
