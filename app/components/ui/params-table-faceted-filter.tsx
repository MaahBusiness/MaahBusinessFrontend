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
import { PickerDropdown } from "@/components/sales/picker-dropdown";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "react-router";

interface ParamsFacetedFilterProps<TData, TValue> {
  title?: string;
  options: {
    label: string;
    value: string;
    key: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function ParamsFacetedFilter<TData, TValue>({
  title,
  options,
}: ParamsFacetedFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
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
    <PickerDropdown
      open={open}
      onOpenChange={setOpen}
      minWidth={220}
      maxWidth={320}
      mobileCenter
      trigger={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-dashed"
          onClick={() => setOpen((prev) => !prev)}
        >
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
      }
    >
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
                    setSearchParams((params) => {
                      const next = new URLSearchParams(params);
                      if (isSelected) {
                        next.delete(option.key);
                      } else {
                        next.set(option.key, option.value);
                      }
                      return next;
                    });
                    setOpen(false);
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
                    setSearchParams((params) => {
                      const next = new URLSearchParams(params);
                      options.forEach((o) => next.delete(o.key));
                      return next;
                    });
                    setOpen(false);
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
    </PickerDropdown>
  );
}
