import { type Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "react-router";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  accessorKey: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  accessorKey,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const ordered = searchParams.get("order_by") === accessorKey;
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          className,
          "!text-xxs font-normal uppercase text-muted-foreground",
        )}
      >
        {title}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent !text-xxs font-normal uppercase text-muted-foreground "
          >
            <span>{title}</span>
            {ordered ? (
              <ArrowDown size={4} className="text-muted-foreground" />
            ) : (
              <ChevronsUpDown size={4} className="text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() =>
              setSearchParams((searchParams) => {
                searchParams.set("order_by", accessorKey);
                return searchParams;
              })
            }
          >
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground/70" />
            Order by {title}
          </DropdownMenuItem>
          {/* <DropdownMenuItem
            onClick={() =>
              setSearchParams((searchParams) => {
                searchParams.set("name", accessorKey);
                searchParams.set("order_by", "desc");
                return searchParams;
              })
            }
          >
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
