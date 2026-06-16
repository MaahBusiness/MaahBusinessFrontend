import { Check, ChevronDownIcon, X } from "lucide-react";

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
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useOrganisation } from "@/hooks/use-organisation";
import type { DataTableToolbarProps } from "types";
import { visibles } from "@/routes/dashboard/clients/data";
import { useSearchParams } from "react-router";
import { hasPermission } from "utils/permissions";
import { CreateInvoiceDrawer } from "@/components/sales/invoice-add-new-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { searchFilters } from "@/routes/dashboard/sales/data";
import { ParamsFacetedFilter } from "@/components/ui/params-table-faceted-filter";
import { types } from "@/routes/dashboard/clients/data";
import { AddClientDialog } from "@/components/clients/client-dialogs";

export function ClientTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { businessMember, isLoading } = useOrganisation();

  const [filter, setFilter] = useState(searchFilters[0].value);
  const [search, setSearch] = useState("");

  return (
    <div className="flex items-center justify-between overflow-x-scroll no-scrollbar">
      <div className="flex flex-1 items-center space-x-2">
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
          title="Type"
          options={types.map((t) => ({
            ...t,
            value: t.value.toLocaleUpperCase(),
            key: "customer_type",
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
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} options={visibles} />
        {isLoading ? (
          <Button size={"sm"}>
            <Skeleton className="h-2 w-8" />
          </Button>
        ) : (
          hasPermission(businessMember?.role, "customers:crud") && (
            <AddClientDialog />
          )
        )}
      </div>
    </div>
  );
}
