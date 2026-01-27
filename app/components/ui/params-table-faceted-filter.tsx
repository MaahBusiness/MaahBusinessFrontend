import * as React from "react";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "react-router";

interface DataTableFacetedFilterProps<TData, TValue> {
  title?: string;
  options: {
    label: string;
    value: string;
    key: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const paramPairs = React.useMemo(() => {
    return Array.from(searchParams.entries()).map(([key, value]) => ({
      key,
      value,
    }));
  }, [searchParams]);

  const selectedValues = React.useMemo(() => {
    return new Set(
      options
        .filter((option) =>
          paramPairs.some(
            (p) => p.key === option.key && p.value === option.value,
          ),
        )
        .map((option) => `${option.key}:${option.value}`),
    );
  }, [options, paramPairs]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 1 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) =>
                      selectedValues.has(`${option.key}:${option.value}`),
                    )
                    .map((option, id) => (
                      <Badge
                        variant="secondary"
                        key={id}
                        className="rounded-sm px-1 font-normal "
                      >
                        <span className="max-w-14 truncate">
                          {option.label}
                        </span>
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(
                  `${option.key}:${option.value}`,
                );
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const id = `${option.key}:${option.value}`;

                      if (isSelected) selectedValues.delete(id);
                      else selectedValues.add(id);

                      setSearchParams((_params) => {
                        _params.has(option.key)
                          ? _params.delete(option.key)
                          : _params.set(option.key, option.value);
                        return _params;
                      });
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />

                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSearchParams((_params) => {
                        options.forEach((o) => _params.delete(o.key));
                        return _params;
                      });
                    }}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
