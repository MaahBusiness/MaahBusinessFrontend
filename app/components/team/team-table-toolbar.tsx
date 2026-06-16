import { Check, ChevronDownIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DataTableFacetedFilter } from "../ui/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { rolesMini, statuses, visibles } from "@/routes/dashboard/team/data";
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
import { AddNewDialog } from "@/components/team/team-dialogs";
import { hasPermission } from "utils/permissions";
import { useOrganisation } from "@/hooks/use-organisation";
import type { DataTableToolbarProps } from "types";

export function TeamTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const filters = ["name", "email"];
  const { businessMember } = useOrganisation();

  const [filter, setFilter] = useState(filters[0]);

  return (
    <div className="flex items-center justify-between overflow-x-scroll no-scrollbar">
      <div className="flex flex-1 items-center space-x-2">
        <InputGroup className="h-8 w-[200px] lg:w-[250px]">
          <InputGroupInput
            placeholder="Search team..."
            value={(table.getColumn(filter)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filter)?.setFilterValue(event.target.value)
            }
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
                {filters.map((f, i) => (
                  <DropdownMenuItem key={i} onClick={() => setFilter(f)}>
                    {capitalizeFirstChar(f)}
                    <Check
                      className={cn(
                        "ml-auto",
                        f === filter ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Role"
            options={rolesMini}
          />
        )}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} options={visibles} />
        {hasPermission(businessMember?.role, "manage:members") && (
          <AddNewDialog />
        )}
      </div>
    </div>
  );
}
