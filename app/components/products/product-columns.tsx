import type { ColumnDef, RowData } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import type { Category, Product, Subcategory } from "types";
import { Avatar, AvatarImage, BoringFallback } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/params-table-column-header";
import { Check, TrendingDown, X } from "lucide-react";
import { ProductTableContextMenu } from "@/components/products/product-table-context-menu";
import { ProductTableRowActions } from "@/components/products/product-table-row-actions";
import { Link } from "react-router";
import { extractImageUrl, formatDisplayAmount } from "utils";

export const productCols = ({
  cats,
}: {
  cats?: Category[];
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
        <div className="flex flex-row items-center gap-2 px-4">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
          <Avatar className="size-10 rounded-sm">
            <AvatarImage src={extractImageUrl(entry.image_url)} />
            <BoringFallback name={entry.id} square variant="marble" />
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
    cell: ({ row, cell }) => (
      <ProductTableContextMenu className="w-[80px]" {...{ cell }}>
        <span className="truncate">{row.getValue("id")}</span>
      </ProductTableContextMenu>
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
    cell: ({ row, cell }) => (
      <ProductTableContextMenu
        className="w-[200px] truncate"
        title={row.getValue("name")}
        {...{ cell }}
      >
        <Link to={`../products/${row.original.id}`} className="hover:underline">
          {row.getValue("name")}
        </Link>
      </ProductTableContextMenu>
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
    cell: ({ row, cell }) =>
      row.getValue("desc") ? (
        <ProductTableContextMenu className="gap-2" {...{ cell }}>
          <span
            title={row.getValue("desc")}
            className="max-w-[400px] truncate "
          >
            {row.getValue("desc")}
          </span>
        </ProductTableContextMenu>
      ) : (
        <span className="text-muted-foreground ">No description</span>
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
    cell: ({ row, cell }) => (
      <ProductTableContextMenu {...{ cell }}>
        <Avatar className="size-10 rounded-sm">
          <AvatarImage src={extractImageUrl(row.original.barcode_image_url)} />
          <BoringFallback name={row.original.id} square variant="bauhaus" />
        </Avatar>
      </ProductTableContextMenu>
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
    cell: ({ row, cell }) => {
      const id = row.getValue("cat");
      const cat = cats?.find((c) => c.id === id);
      return (
        <ProductTableContextMenu {...{ cell }}>
          <Link
            to={`../products/categories/${cat?.id}`}
            className="hover:underline"
          >
            <span>{cat?.name || `${id}`}</span>
          </Link>
        </ProductTableContextMenu>
      );
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
    cell: ({ row, cell }) => {
      const data = row.original;
      const sub = cats
        ?.find((c) => c.id === data.category_id)
        ?.subcategories?.find((s) => s.id === data.subcategory_id);
      return (
        <ProductTableContextMenu {...{ cell }}>
          <Link
            to={`../product/categories/${data.category_id}/${data.subcategory_id}`}
            className="hover:underline"
          >
            <span>{sub?.name || `${data.subcategory_id}`}</span>
          </Link>
        </ProductTableContextMenu>
      );
    },
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
    cell: ({ row, cell }) => {
      return (
        <ProductTableContextMenu
          {...{ cell }}
          className="text-right font-medium"
        >
          <span>{formatDisplayAmount(row.getValue("purchase"))}</span>
        </ProductTableContextMenu>
      );
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
    cell: ({ row, cell }) => {
      return (
        <ProductTableContextMenu
          {...{ cell }}
          className="text-right font-medium"
        >
          <span>{formatDisplayAmount(row.getValue("unit"))}</span>
        </ProductTableContextMenu>
      );
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
    cell: ({ row, cell }) => {
      return (
        <ProductTableContextMenu
          {...{ cell }}
          className="justify-end font-medium"
        >
          {formatDisplayAmount(row.getValue("current"))}
        </ProductTableContextMenu>
      );
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
    cell: ({ row, cell }) => {
      const item = row.original;

      return (
        <ProductTableContextMenu {...{ cell }}>
          <span className="max-w-[500px] truncate ">{item?.quantity}</span>
          {item.is_low_stock && (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
        </ProductTableContextMenu>
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
    cell: ({ row, cell }) => {
      const item = row.original;
      return (
        <ProductTableContextMenu
          {...{ cell }}
          title={new Date(item.expiry_date ?? "").toLocaleString("en", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        >
          {item.is_expired ? (
            <span className="text-destructive">Expired</span>
          ) : item.expiry_date ? (
            new Date(item.expiry_date).toLocaleDateString()
          ) : (
            "---"
          )}
        </ProductTableContextMenu>
      );
    },
    enableSorting: false,
  },

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
    cell: ({ row, cell }) => {
      const item = row.original;
      return (
        <ProductTableContextMenu {...{ cell }} className="justify-center">
          {item.on_promotion ? (
            <Check className="size-4 text-muted-foreground" />
          ) : (
            <X className="size-4 text-muted-foreground" />
          )}
        </ProductTableContextMenu>
      );
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
    cell: ({ row, cell }) => {
      return (
        <ProductTableContextMenu
          {...{ cell }}
          className="text-right font-medium"
        >
          {row.original.on_promotion
            ? formatDisplayAmount(row.getValue("promo-price"))
            : "--"}
        </ProductTableContextMenu>
      );
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
    cell: ({ row, cell }) => {
      const item = row.original;
      if (item.promotion_start_date)
        return (
          <ProductTableContextMenu
            {...{ cell }}
            title={new Date(item.promotion_start_date).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          >
            {new Date(item.promotion_start_date).toLocaleDateString()}
          </ProductTableContextMenu>
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
    cell: ({ row, cell }) => {
      const item = row.original;
      if (item.promotion_end_date)
        return (
          <ProductTableContextMenu
            {...{ cell }}
            title={new Date(item.promotion_end_date).toLocaleString("en", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          >
            {new Date(item.promotion_end_date).toLocaleDateString()}
          </ProductTableContextMenu>
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
    cell: ({ row, cell }) => {
      const item = row.original;
      if (item.updated_at)
        return (
          <ProductTableContextMenu
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
          </ProductTableContextMenu>
        );
      else return null;
    },
    meta: { hidden: true, sort: true },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductTableRowActions row={row} />,
  },
];
