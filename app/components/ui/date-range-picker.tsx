// components/ui/date-range-picker.tsx

import * as React from "react";
import { endOfDay, format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PickerDropdown } from "@/components/sales/picker-dropdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldLabel, FieldError } from "@/components/ui/field";
import type { DateRange } from "react-day-picker";

/**
 * Props for the DateRangePicker component
 *
 * @interface DateRangePickerProps
 */
export interface DateRangePickerProps {
  /**
   * The currently selected date range value.
   * Contains from and to dates, or undefined if not selected.
   *
   * @type {DateRange | undefined}
   * @default undefined
   *
   * @example
   * value={{ from: new Date(2025, 0, 1), to: new Date(2025, 0, 31) }}
   */
  value?: DateRange;

  /**
   * Callback fired when the date range value changes.
   * Receives the new DateRange object or undefined if cleared.
   *
   * @param {DateRange | undefined} range - The new date range value
   * @returns {void}
   *
   * @example
   * onChange={(range) => {
   *   console.log('From:', range?.from);
   *   console.log('To:', range?.to);
   *   setMyDateRange(range);
   * }}
   */
  onChange?: (range: DateRange | undefined) => void;

  /**
   * Format string for displaying selected dates.
   * Uses date-fns format tokens.
   *
   * @type {string}
   * @default "LLL dd, y"
   * @see {@link https://date-fns.org/docs/format}
   *
   * @example
   * dateFormat="LLL dd, y"     // Jan 01, 2025
   * dateFormat="MMM d, yyyy"   // Jan 1, 2025
   * dateFormat="yyyy-MM-dd"    // 2025-01-01
   */
  dateFormat?: string;

  /**
   * Placeholder text shown when no date range is selected.
   *
   * @type {string}
   * @default "Pick a date range"
   */
  placeholder?: string;

  /**
   * Label text for the date range picker field.
   *
   * @type {string}
   * @example
   * label="Reporting Period"
   */
  label?: string;

  /**
   * Error message to display below the picker.
   * When provided, the field will be styled in an error state.
   *
   * @type {string}
   * @example
   * error="Date range is required"
   * error={formErrors.dateRange?.message}
   */
  error?: string;

  /**
   * Whether the field is required.
   * Displays a red asterisk (*) next to the label.
   *
   * @type {boolean}
   * @default false
   */
  required?: boolean;

  /**
   * Whether the picker is disabled.
   * Prevents user interaction.
   *
   * @type {boolean}
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the picker should close when a range has been selected.
   *
   * @type {boolean}
   * @default false
   */
  closeOnSelect?: boolean;

  /**
   * Name attribute for form submission.
   * Creates two hidden inputs: `${name}_from` and `${name}_to` with ISO string values.
   *
   * @type {string}
   * @example
   * name="reportPeriod"
   * // Form data will contain:
   * // reportPeriod_from: "2025-01-01T00:00:00.000Z"
   * // reportPeriod_to: "2025-01-31T00:00:00.000Z"
   */
  name?: string;

  /**
   * ID attribute for the trigger button.
   *
   * @type {string}
   */
  id?: string;

  /**
   * Number of months to display in the calendar.
   *
   * @type {number}
   * @default 2
   * @example
   * numberOfMonths={1} // Single month view
   * numberOfMonths={2} // Two months side-by-side (default)
   */
  numberOfMonths?: number;

  /**
   * Minimum selectable date.
   * Dates before this will be disabled.
   *
   * @type {Date}
   * @example
   * minDate={new Date()} // Disable past dates
   */
  minDate?: Date;

  /**
   * Maximum selectable date.
   * Dates after this will be disabled.
   *
   * @type {Date}
   * @example
   * maxDate={new Date(2025, 11, 31)} // Disable dates after Dec 31, 2025
   */
  maxDate?: Date;

  /**
   * Array of specific dates to disable.
   *
   * @type {Date[]}
   * @example
   * disabledDates={[new Date(2025, 0, 1), new Date(2025, 11, 25)]}
   */
  disabledDates?: Date[];

  /**
   * CSS class name for the root container.
   *
   * @type {string}
   */
  className?: string;

  /**
   * CSS class name for the trigger button.
   *
   * @type {string}
   * @example
   * buttonClassName="w-[300px]"
   */
  buttonClassName?: string;

  /**
   * Size prop for the trigger button.
   *
   * @type {string}
   * @example
   * buttonSize="sm"
   */
  buttonSize?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

  /**
   * Alignment of the popover relative to the trigger.
   *
   * @type {"start" | "center" | "end"}
   * @default "end"
   */
  align?: "start" | "center" | "end";

  /**
   * Use a fixed-position portal (works inside overflow-hidden containers).
   *
   * @type {boolean}
   * @default false
   */
  useFixedPortal?: boolean;

  /**
   * Show Apply / Clear footer — range is committed only when Apply is clicked.
   *
   * @type {boolean}
   * @default false
   */
  showActions?: boolean;

  /**
   * Quick preset ranges shown above the calendar.
   */
  presets?: Array<{ label: string; range: DateRange }>;
}

/**
 * DateRangePicker Component
 *
 * A reusable date range picker that allows users to select a start and end date.
 * Displays a calendar popover with customizable months and supports form integration.
 *
 * @component
 * @example
 * // Basic usage
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   label="Select Period"
 * />
 *
 * @example
 * // With validation and form integration
 * <DateRangePicker
 *   value={reportPeriod}
 *   onChange={setReportPeriod}
 *   label="Reporting Period"
 *   name="reportPeriod"
 *   required
 *   error={errors.reportPeriod}
 * />
 *
 * @example
 * // With date constraints
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   minDate={new Date()}
 *   maxDate={new Date(2025, 11, 31)}
 *   numberOfMonths={1}
 * />
 */
export function DateRangePicker({
  value,
  onChange,
  dateFormat = "LLL dd, y",
  placeholder = "Pick a date range",
  label,
  error,
  required = false,
  disabled = false,
  name,
  id,
  numberOfMonths = 2,
  minDate,
  maxDate,
  disabledDates,
  closeOnSelect,
  className,
  buttonClassName,
  buttonSize,
  align = "end",
  useFixedPortal = false,
  showActions = false,
  presets,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalRange, setInternalRange] = React.useState<
    DateRange | undefined
  >(value);
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
    value,
  );

  const displayRange = showActions ? draftRange : internalRange;

  // Sync internal state with external value
  React.useEffect(() => {
    setInternalRange(value);
    if (!open) setDraftRange(value);
  }, [value, open]);

  React.useEffect(() => {
    if (open && showActions) {
      setDraftRange(value);
    }
  }, [open, showActions, value]);

  const normalizeMaxDate = maxDate
    ? endOfDay(maxDate)
    : undefined;
  const normalizeMinDate = minDate
    ? startOfDay(minDate)
    : undefined;

  const commitRange = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return;
    const committed = {
      from: startOfDay(range.from),
      to: endOfDay(range.to),
    };
    setInternalRange(committed);
    onChange?.(committed);
    setOpen(false);
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (showActions) {
      setDraftRange(range);
      return;
    }

    setInternalRange(range);
    onChange?.(range);

    if (range?.from && range?.to && closeOnSelect) {
      setOpen(false);
    }
  };

  const handleApply = () => {
    commitRange(draftRange);
  };

  const handleClear = () => {
    setDraftRange(undefined);
    setInternalRange(undefined);
    onChange?.(undefined);
    setOpen(false);
  };

  const applyPreset = (range: DateRange) => {
    setDraftRange(range);
    commitRange(range);
  };

  const triggerButton = (
    <Button
      id={id || name}
      type="button"
      variant="outline"
      disabled={disabled}
      size={buttonSize}
      className={cn(
        "justify-start text-left font-normal",
        !displayRange?.from && "text-muted-foreground",
        buttonClassName,
      )}
      onClick={
        useFixedPortal && !disabled
          ? () => setOpen((prev) => !prev)
          : undefined
      }
    >
      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
      {displayRange?.from ? (
        displayRange.to ? (
          <>
            {format(displayRange.from, dateFormat)} –{" "}
            {format(displayRange.to, dateFormat)}
          </>
        ) : (
          <>
            {format(displayRange.from, dateFormat)} – …
          </>
        )
      ) : (
        <span>{placeholder}</span>
      )}
    </Button>
  );

  const calendarFooter = showActions ? (
    <div className="flex flex-col gap-2 border-t p-3">
      <p className="text-xs text-muted-foreground">
        {draftRange?.from && !draftRange?.to
          ? "Now select the end date"
          : "Select a start date, then an end date"}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!draftRange?.from || !draftRange?.to}
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
    </div>
  ) : null;

  const presetBar =
    presets && presets.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 border-b p-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 text-xs"
            onClick={() => applyPreset(preset.range)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    ) : null;

  const calendar = (
    <>
      {presetBar}
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={displayRange?.from ?? displayRange?.to ?? new Date()}
        selected={displayRange}
        onSelect={handleSelect}
        numberOfMonths={numberOfMonths}
        disabled={(date) => {
          const day = startOfDay(date);
          if (normalizeMinDate && day < normalizeMinDate) return true;
          if (normalizeMaxDate && day > normalizeMaxDate) return true;
          if (
            disabledDates?.some(
              (d) => d.toDateString() === date.toDateString(),
            )
          ) {
            return true;
          }
          return false;
        }}
      />
      {calendarFooter}
    </>
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <FieldLabel htmlFor={id || name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FieldLabel>
      )}

      <div>
        {useFixedPortal ? (
          <PickerDropdown
            open={open}
            onOpenChange={setOpen}
            align={align === "end" ? "end" : "start"}
            minWidth={numberOfMonths > 1 ? 560 : 300}
            maxWidth={numberOfMonths > 1 ? 560 : 340}
            matchTriggerWidth={false}
            mobileCenter
            trigger={triggerButton}
          >
            <div className="p-0">{calendar}</div>
          </PickerDropdown>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
              {calendar}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {error && <FieldError>{error}</FieldError>}

      {/* Hidden inputs for form submission */}
      {name && (
        <>
          <input
            type="hidden"
            name={`${name}_from`}
            value={
              internalRange?.from
                ? startOfDay(internalRange.from).toISOString()
                : ""
            }
          />
          <input
            type="hidden"
            name={`${name}_to`}
            value={
              internalRange?.to ? endOfDay(internalRange.to).toISOString() : ""
            }
          />
        </>
      )}
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Basic usage
function Example1() {
  const [dateRange, setDateRange] = useState<DateRange>();

  return (
    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      label="Select Period"
    />
  );
}

// Example 2: With validation
function Example2() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError("Please select a date range");
      return;
    }
    console.log("Selected range:", dateRange);
  };

  return (
    <DateRangePicker
      value={dateRange}
      onChange={(range) => {
        setDateRange(range);
        setError("");
      }}
      label="Reporting Period"
      name="reportPeriod"
      required
      error={error}
    />
  );
}

// Example 3: With date constraints
function Example3() {
  const [dateRange, setDateRange] = useState<DateRange>();

  return (
    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      label="Booking Dates"
      minDate={new Date()} // No past dates
      maxDate={new Date(2025, 11, 31)} // Max end of year
      disabledDates={[
        new Date(2025, 0, 1), // New Year
        new Date(2025, 11, 25), // Christmas
      ]}
      numberOfMonths={1}
    />
  );
}

// Example 4: Custom formatting and styling
function Example4() {
  const [dateRange, setDateRange] = useState<DateRange>();

  return (
    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      label="Custom Format"
      dateFormat="yyyy-MM-dd"
      placeholder="YYYY-MM-DD to YYYY-MM-DD"
      buttonClassName="w-[300px]"
      align="start"
    />
  );
}

// Example 5: Form integration with React Hook Form
import { useForm, Controller } from "react-hook-form";

function Example5() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data.dateRange);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="dateRange"
        control={control}
        rules={{ required: "Date range is required" }}
        render={({ field, fieldState }) => (
          <DateRangePicker
            value={field.value}
            onChange={field.onChange}
            label="Reporting Period"
            error={fieldState.error?.message}
            required
          />
        )}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// Example 6: Form submission with FormData
function Example6() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const fromDate = formData.get("period_from") as string;
    const toDate = formData.get("period_to") as string;

    console.log({
      from: fromDate ? new Date(fromDate) : null,
      to: toDate ? new Date(toDate) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DateRangePicker
        label="Reporting Period"
        name="period"
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// Example 7: Presets/Quick Select (common date ranges)
function Example7() {
  const [dateRange, setDateRange] = useState<DateRange>();

  const selectLast7Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    setDateRange({ from, to });
  };

  const selectLast30Days = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    setDateRange({ from, to });
  };

  return (
    <div className="space-y-2">
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        label="Select Period"
      />
      <div className="flex gap-2">
        <button onClick={selectLast7Days} className="text-sm">
          Last 7 days
        </button>
        <button onClick={selectLast30Days} className="text-sm">
          Last 30 days
        </button>
      </div>
    </div>
  );
}
*/
