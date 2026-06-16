import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

interface CalendarDateRangePickerProps {
  className?: string;
  value?: DateRange;
  onRangeChange?: (range: DateRange | undefined) => void;
}

export function CalendarDateRangePicker({
  className,
  value,
  onRangeChange,
}: CalendarDateRangePickerProps) {
  const [internal, setInternal] = React.useState<DateRange | undefined>(
    value ?? {
      from: addDays(new Date(), -6),
      to: new Date(),
    },
  );

  const date = value ?? internal;

  const handleSelect = (range: DateRange | undefined) => {
    if (!value) setInternal(range);
    onRangeChange?.(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[260px] justify-start border-violet-500/20 bg-card/80 text-left font-normal backdrop-blur-sm",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 size-4 text-violet-600" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} – {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function dateRangeToFilters(range?: DateRange) {
  if (!range?.from) return {};
  return {
    start_date: format(range.from, "yyyy-MM-dd"),
    end_date: format(range.to ?? range.from, "yyyy-MM-dd"),
  };
}
