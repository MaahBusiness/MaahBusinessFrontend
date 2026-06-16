import {
  AlertTriangleIcon,
  ArrowRight,
  CalendarClock,
  Check,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  ShareIcon,
  TrashIcon,
  UserRoundXIcon,
  VolumeOffIcon,
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
import { useParams, useSearchParams } from "react-router";
import { AddProductDrawer } from "@/components/products/product-add-new-drawer";
import { hasPermission } from "utils/permissions";
import { CreateInvoiceDrawer } from "@/components/sales/invoice-add-new-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { searchFilters, statuses } from "@/routes/dashboard/sales/data";
import { ParamsFacetedFilter } from "@/components/ui/params-table-faceted-filter";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ButtonGroup } from "@/components/ui/button-group";
import type { DateRange } from "react-day-picker";

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

  const [filter, setFilter] = useState(searchFilters[0].value);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultDateRange,
  );

  const selectLast7Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    setDateRange({ from, to });

    setSearchParams((params) => {
      params.set("start_date", from?.toISOString());
      params.set("end_date", to?.toISOString());
      return params;
    });
  };

  const selectLast30Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    setDateRange({ from, to });

    setSearchParams((params) => {
      params.set("start_date", from?.toISOString());
      params.set("end_date", to?.toISOString());
      return params;
    });
  };

  const handleDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setSearchParams((params) => {
      params.set("start_date", dateRange.from?.toISOString() ?? "");
      params.set("end_date", dateRange.to?.toISOString() ?? "");
      return params;
    });
  };

  return (
    <div className="flex items-center justify-between overflow-x-scroll no-scrollbar">
      <div className="flex flex-1 items-center space-x-2 ">
        <InputGroup className="h-8 w-[200px] lg:w-[250px]">
          <InputGroupInput
            placeholder="Search team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = search.trim();

                setSearchParams((params) => {
                  if (value) {
                    params.set("search", value);
                    params.set("name", filter);
                  } else {
                    params.delete("search");
                    params.delete("name");
                  }
                  return params;
                });
              }
            }}
          />

          <InputGroupAddon align="inline-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton
                  variant="ghost"
                  className="!pr-1.5 text-xs outline-0 focus-visible:ring-0"
                >
                  Search {filter}
                  <ChevronDownIcon className="size-3" />
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                {searchFilters.map((f, i) => (
                  <DropdownMenuItem key={i} onClick={() => setFilter(f.value)}>
                    {f.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        f.value === filter ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>

        <ParamsFacetedFilter
          title="Status"
          options={statuses.map((s) => ({
            ...s,
            key: s.value.toLocaleUpperCase(),
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
                    setSearchParams((params) => {
                      params.delete("start_date");
                      params.delete("end_date");
                      return params;
                    });
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
            onChange={setDateRange}
          />
          <Button
            variant="outline"
            size={"sm"}
            className="!pl-2 h-8 border-dashed bg-accent "
            onClick={handleDateRange}
          >
            <ArrowRight />
          </Button>
        </ButtonGroup>

        {searchParams.size > 2 && (
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
      <div className="flex items-center space-x-2">
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
