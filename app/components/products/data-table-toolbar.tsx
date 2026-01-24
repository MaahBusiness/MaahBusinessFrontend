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
import { capitalizeFirstChar } from "utils";
import { cn } from "@/lib/utils";
import { useOrganisation } from "@/hooks/use-organisation";
import type { DataTableToolbarProps } from "types";
import { DataTableFacetedFilter } from "@/components/products/data-table-faceted-filter";
import {
  expiry,
  filters,
  searchFilters,
} from "@/routes/dashboard/products/data";
import { useSearchParams } from "react-router";

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const isFiltered = table.getState().columnFilters.length > 0;

  const [filter, setFilter] = useState(searchFilters[0].value);
  const [search, setSearch] = useState("");

  return (
    <div className="flex items-center justify-between">
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

        <DataTableFacetedFilter title="Filters" options={filters} />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() =>
              setSearchParams((_params) => {
                [...filters, ...searchFilters].forEach((f) =>
                  _params.delete(f.value),
                );
                return _params;
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
        <DataTableViewOptions table={table} />
        {/* {hasPermission(businessMember?.role, "manage:members") && (
          <AddNewDialog />
        )} */}
      </div>
    </div>
  );
}
