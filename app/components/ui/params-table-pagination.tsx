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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1">
      <div className="text-xs text-muted-foreground tablet:text-sm">
        {meta.count} total · Page {meta.current_page} of {meta.total_pages}
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <p className="shrink-0 text-xs font-medium sm:text-sm">Rows</p>
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
        <div className="flex items-center gap-1">
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
