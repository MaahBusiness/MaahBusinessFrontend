import type { ColumnDef, RowData } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import type { Category, Product, Subcategory } from "types";
import { Avatar, AvatarImage, BoringFallback } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/param-table-column-header";
import { Check, TrendingDown, X } from "lucide-react";
import { expiry } from "@/routes/dashboard/products/data";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    hidden?: boolean;
    sort?: boolean;
  }
}

export const productCols = ({
  cats,
  subs,
}: {
  cats?: Category[];
  subs?: Subcategory[];
}): ColumnDef<Product>[] => [
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
      const entry = row.original;
      return (
        <div className="flex flex-row items-center gap-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
          <Avatar className="size-10 rounded-sm">
            <AvatarImage src={entry.image_url} />
            <BoringFallback name={entry.id} square variant="bauhaus" />
          </Avatar>
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
      <DataTableColumnHeader accessorKey="id" column={column} title="ID" />
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader accessorKey="name" column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="w-[200px] truncate" title={row.getValue("name")}>
        {row.getValue("name")}
      </div>
    ),
    enableHiding: false,
  },
  {
    id: "desc",
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="description"
        column={column}
        title="Description"
      />
    ),
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        {row.getValue("desc") ? (
          <span
            title={row.getValue("desc")}
            className="max-w-[400px] truncate "
          >
            {row.getValue("desc")}
          </span>
        ) : (
          <span className="text-muted-foreground ">No description</span>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "barcode",
    accessorKey: "barcode",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="barcode"
        column={column}
        title="Barcode"
      />
    ),
    cell: ({ row }) => (
      <Avatar className="size-10 rounded-sm">
        <AvatarImage src={row.original.barcode_image_url} />
        <BoringFallback name={row.original.id} square variant="bauhaus" />
      </Avatar>
    ),
    enableSorting: false,
  },
  {
    id: "cat",
    accessorKey: "category_id",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="category_id"
        column={column}
        title="Category"
      />
    ),
    cell: ({ row }) => {
      const id = row.getValue("cat");
      const cat = cats?.find((c) => c.id === id);
      return cat?.name || id;
    },
    enableSorting: false,
  },
  {
    id: "sub",
    accessorKey: "subcategory_id",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="subcategory_id"
        column={column}
        title="Subcategory"
      />
    ),
    enableSorting: false,
  },
  {
    id: "purchase",
    accessorKey: "purchase_price",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="purchase_price"
        column={column}
        className="text-right"
        title="Purchase Price"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("purchase"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
    meta: { hidden: true },
    enableSorting: false,
  },
  {
    id: "unit",
    accessorKey: "unit_price",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="unit_price"
        column={column}
        className="text-right"
        title="Unit Price"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("unit"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "current",
    accessorKey: "current_price",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="current_price"
        column={column}
        className="text-right"
        title="Current Price"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("current"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
    enableSorting: false,
    meta: { hidden: true },
  },
  {
    id: "stock",
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="quantity"
        column={column}
        title="QTY In Stock"
      />
    ),
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex gap-2 items-center justify-center">
          <span className="max-w-[500px] truncate ">{item?.quantity}</span>
          {item.is_low_stock && (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
        </div>
      );
    },
  },
  {
    id: "expiry",
    accessorKey: "expiry_date",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="expiry_date"
        column={column}
        className="text-right"
        title="Expiry Date"
      />
    ),
    cell: ({ row }) => {
      const item = row.original;
      if (item.expiry_date)
        return (
          <span
            title={new Date(item.expiry_date).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          >
            {item.is_expired ? (
              <span className="text-destructive">Expired</span>
            ) : (
              new Date(item.expiry_date).toLocaleDateString()
            )}
          </span>
        );
      else return null;
    },
    enableSorting: false,

    // meta: { hidden: true },
  },
  // {
  //   id: "expired",
  //   accessorKey: "is_expired",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader
  //       accessorKey="is_expired"
  //       column={column}
  //       className="text-right"
  //       title="Expired?"
  //     />
  //   ),
  //   cell: ({ row }) => {
  //     const priority = expiry.find(
  //       (priority) => Boolean(priority.value) == row.original.is_expired,
  //     );

  //     if (!priority) {
  //       return null;
  //     }

  //     return (
  //       <div className="flex items-center">
  //         {priority.icon && (
  //           <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //         )}
  //         <span>
  //           {priority.label} - {row.getValue("expiry")}
  //         </span>
  //       </div>
  //     );
  //   },
  //   enableSorting: false,

  //   meta: { hidden: true },
  // },
  {
    id: "promotion",
    accessorKey: "on_promotion",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="on_promotion"
        column={column}
        title="On Promotion?"
      />
    ),
    cell: ({ row }) => {
      const item = row.original;
      if (item.expiry_date)
        return (
          <div className="flex items-center justify-center">
            {item.is_expired ? (
              <Check className="size-4 text-muted-foreground" />
            ) : (
              <X className="size-4 text-muted-foreground" />
            )}
          </div>
        );
      else return null;
    },
    enableSorting: false,
  },
  {
    id: "promo-price",
    accessorKey: "promo_price",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="promo_price"
        column={column}
        className="text-right"
        title="Promo Price"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("promo-price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
    enableSorting: false,
  },

  {
    id: "promo-start",
    accessorKey: "promotion_start_date",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="promotion_start_date"
        column={column}
        title="Start Date"
      />
    ),
    cell: ({ row }) => {
      const item = row.original;
      if (item.promotion_start_date)
        return (
          <span
            title={new Date(item.promotion_start_date).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          >
            {new Date(item.promotion_start_date).toLocaleDateString()}
          </span>
        );
      else return null;
    },
    enableSorting: false,
    meta: { hidden: true },
  },
  {
    id: "promo-end",
    accessorKey: "promotion_end_date",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="promotion_end_date"
        column={column}
        title="End Date"
      />
    ),
    cell: ({ row }) => {
      const item = row.original;
      if (item.promotion_end_date)
        return (
          <span
            title={new Date(item.promotion_end_date).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          >
            {new Date(item.promotion_end_date).toLocaleDateString()}
          </span>
        );
      else return null;
    },
    enableSorting: false,
    meta: { hidden: true },
  },
  {
    id: "updated",
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader
        accessorKey="updated_at"
        column={column}
        title="Last Updated"
      />
    ),
    cell: ({ row }) => {
      const item = row.original;
      if (item.updated_at)
        return (
          <span
            title={new Date(item.updated_at).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          >
            {new Date(item.updated_at).toLocaleDateString()}
          </span>
        );
      else return null;
    },
    meta: { hidden: true, sort: true },
  },
  {
    id: "actions",
    // cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
