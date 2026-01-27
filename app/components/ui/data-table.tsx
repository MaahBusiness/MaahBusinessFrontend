import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { TablePagination } from "./params-table-pagination";
import type { DataTableToolbarProps, Pagination } from "types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: Pagination;
  DataTableToolbar<TData>({
    table,
  }: DataTableToolbarProps<TData>): React.JSX.Element;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  DataTableToolbar,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const initialSort = columns.reduce(
    (acc, column) => {
      if (column.meta?.sort && column?.id) {
        acc.push({ id: column.id, desc: column.meta?.sort });
      }
      return acc;
    },
    [{}] as SortingState,
  );
  const [sorting, setSorting] = React.useState<SortingState>(initialSort);

  const initialVisibility = columns.reduce((acc, column) => {
    if (column.meta?.hidden && (column as any)?.id) {
      acc[(column as any).id as string] = false;
    }
    return acc;
  }, {} as VisibilityState);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialVisibility);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="text-xs font-normal px-4 "
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="py-2">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="hover:bg-muted"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm p-0 h-12">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-muted">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {meta ? (
        <TablePagination table={table} meta={meta} />
      ) : (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
