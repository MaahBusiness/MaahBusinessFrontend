import { X } from "lucide-react";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { ParamsFacetedFilter } from "@/components/ui/params-table-faceted-filter";
import { useOrganisation } from "@/hooks/use-organisation";
import type { DataTableToolbarProps } from "types";
import { hasPermission } from "utils/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  approvalFilters,
  expenseTypes,
  paymentMethods,
  visibles,
} from "@/routes/dashboard/expenses/data";
import { AddExpenseDialog } from "@/components/expenses/expense-dialogs";
import { useState } from "react";

export function ExpenseTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { businessMember, isLoading } = useOrganisation();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  return (
    <div className="flex flex-col gap-3 overflow-x-auto no-scrollbar lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <InputGroup className="h-8 w-full min-w-[180px] sm:w-[220px]">
          <InputGroupInput
            placeholder="Search expenses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = search.trim();
                setSearchParams((params) => {
                  if (value) params.set("search", value);
                  else params.delete("search");
                  params.delete("page");
                  return params;
                });
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="ghost"
              className="text-xs"
              onClick={() => {
                const value = search.trim();
                setSearchParams((params) => {
                  if (value) params.set("search", value);
                  else params.delete("search");
                  params.delete("page");
                  return params;
                });
              }}
            >
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <ParamsFacetedFilter
          title="Type"
          options={expenseTypes.map((t) => ({
            ...t,
            key: "expense_type",
          }))}
        />

        <ParamsFacetedFilter
          title="Payment"
          options={paymentMethods.map((t) => ({
            ...t,
            key: "payment_method",
          }))}
        />

        <ParamsFacetedFilter
          title="Status"
          options={approvalFilters.map((t) => ({
            ...t,
            key: "is_approved",
          }))}
        />

        {searchParams.size > 0 && (
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

      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} options={visibles} />
        {isLoading ? (
          <Button size="sm">
            <Skeleton className="h-2 w-8" />
          </Button>
        ) : (
          hasPermission(businessMember?.role, "expenses:manage") && (
            <AddExpenseDialog />
          )
        )}
      </div>
    </div>
  );
}
