import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDownIcon,
  TrashIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useOrganisation } from "@/hooks/use-organisation";
import type { DataTableToolbarProps } from "types";
import { visibles } from "@/routes/dashboard/sales/data";
import { useSearchParams } from "react-router";
import { hasPermission } from "utils/permissions";
import { CreateInvoiceDrawer } from "@/components/sales/invoice-add-new-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { statuses } from "@/routes/dashboard/sales/data";
import { ParamsFacetedFilter } from "@/components/ui/params-table-faceted-filter";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ButtonGroup } from "@/components/ui/button-group";
import type { DateRange } from "react-day-picker";

function applyDateRangeToParams(
  params: URLSearchParams,
  range: DateRange | undefined,
) {
  const next = new URLSearchParams(params);
  if (range?.from && range?.to) {
    next.set("start_date", range.from.toISOString());
    next.set("end_date", range.to.toISOString());
  } else {
    next.delete("start_date");
    next.delete("end_date");
  }
  return next;
}

export function InvoiceTableToolbar<TData>({
  table,
  hideCTA,
}: DataTableToolbarProps<TData>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { businessMember, isLoading } = useOrganisation();

  const defaultDateRange: DateRange | undefined = searchParams.has("start_date")
    ? {
        from: new Date(searchParams.get("start_date")!),
        to: new Date(searchParams.get("end_date") || ""),
      }
    : undefined;

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultDateRange,
  );

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "page" && key !== "page_size",
  );

  const applyDateRange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setSearchParams((params) => applyDateRangeToParams(params, range));
    }
  };

  const selectLast7Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    applyDateRange({ from, to });
  };

  const selectLast30Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    applyDateRange({ from, to });
  };

  const handleDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    setSearchParams((params) => applyDateRangeToParams(params, dateRange));
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <InputGroup className="h-8 w-full min-w-[180px] sm:w-[200px] lg:w-[250px]">
          <InputGroupInput
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = search.trim();

                setSearchParams((params) => {
                  const next = new URLSearchParams(params);
                  if (value) {
                    next.set("search", value);
                  } else {
                    next.delete("search");
                  }
                  return next;
                });
              }
            }}
          />
        </InputGroup>

        <ParamsFacetedFilter
          title="Status"
          options={statuses.map((s) => ({
            label: s.label,
            value: s.value,
            key: "status",
            icon: s.icon,
          }))}
        />

        <ButtonGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size={"sm"}
                className="!pr-2 h-8 border-dashed border-r-0"
              >
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={selectLast7Days}>
                  <CalendarClock />
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={selectLast30Days}>
                  <CalendarClock />
                  Last 30 days
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setDateRange(undefined);
                    setSearchParams((params) =>
                      applyDateRangeToParams(params, undefined),
                    );
                  }}
                >
                  <TrashIcon className="text-destructive" />
                  Reset range
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DateRangePicker
            buttonClassName="h-8 border-dashed rounded-none"
            buttonSize="sm"
            value={dateRange}
            onChange={applyDateRange}
            useFixedPortal
            numberOfMonths={1}
            closeOnSelect
          />
          <Button
            variant="outline"
            size={"sm"}
            className="!pl-2 h-8 border-dashed bg-accent "
            onClick={handleDateRange}
            title="Apply date range"
          >
            <ArrowRight />
          </Button>
        </ButtonGroup>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={() =>
              setSearchParams((_params) => {
                const record: Record<string, string> = {};

                Array.from(_params.entries())
                  .filter(([key]) => key === "page_size" || key === "page")
                  .forEach(([key, value]) => (record[key] = value));

                return new URLSearchParams(record);
              })
            }
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <DataTableViewOptions table={table} options={visibles} />
        {isLoading ? (
          <Button size={"sm"}>
            <Skeleton className="h-2 w-8" />
          </Button>
        ) : (
          hasPermission(businessMember?.role, "invoice:create") &&
          !hideCTA && <CreateInvoiceDrawer />
        )}
      </div>
    </div>
  );
}
