import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "react-router";
import type { Pagination } from "types";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  meta: Pagination;
}

export function TablePagination<TData>({
  table,
  meta,
}: DataTablePaginationProps<TData>) {
  const [_, setSearchParams] = useSearchParams();

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {meta.current_page} of {meta.count} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${meta.page_size}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              setSearchParams((_params) => {
                _params.set("page_size", value);
                return _params;
              });
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={meta.page_size} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {meta.current_page} of {meta.total_pages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() =>
              setSearchParams((_params) => {
                _params.set("current_page", "1");
                return _params;
              })
            }
            disabled={meta.current_page <= 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              setSearchParams((_params) => {
                _params.set("current_page", `${meta.current_page - 1}`);
                return _params;
              })
            }
            disabled={meta.current_page <= 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              setSearchParams((_params) => {
                _params.set("current_page", `${meta.current_page + 1}`);
                return _params;
              })
            }
            disabled={meta.current_page >= meta.total_pages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() =>
              setSearchParams((_params) => {
                _params.set("current_page", `${meta.total_pages}`);
                return _params;
              })
            }
            disabled={meta.current_page >= meta.total_pages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
