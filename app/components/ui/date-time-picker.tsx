// components/ui/datetime-picker.tsx

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

/**
 * Props for the DateTimePicker component
 *
 * @interface DateTimePickerProps
 */
export interface DateTimePickerProps {
  /**
   * The currently selected date/time value.
   *
   * @type {Date | undefined}
   * @default undefined
   */
  value?: Date;

  /**
   * Callback fired when the date/time value changes.
   * Receives the new Date object or undefined if cleared.
   *
   * @param {Date | undefined} date - The new date value
   * @returns {void}
   *
   * @example
   * onChange={(date) => {
   *   console.log('Selected:', date?.toISOString());
   *   setMyDate(date);
   * }}
   */
  onChange?: (date: Date | undefined) => void;

  /**
   * Whether to show the time picker alongside the date picker.
   * When true, displays both date and time inputs in a row.
   * When false, only shows the date picker.
   *
   * @type {boolean}
   * @default false
   */
  showTime?: boolean;

  /**
   * Format string for displaying the selected date.
   * Uses date-fns format tokens.
   *
   * @type {string}
   * @default "PPP"
   * @see {@link https://date-fns.org/docs/format}
   *
   * @example
   * dateFormat="PPP"         // Jan 1, 2025
   * dateFormat="yyyy-MM-dd"  // 2025-01-01
   * dateFormat="MMMM d, yyyy" // January 1, 2025
   */
  dateFormat?: string;

  /**
   * Placeholder text shown when no date is selected.
   *
   * @type {string}
   * @default "Select date"
   */
  placeholder?: string;

  /**
   * Label text for the date picker field.
   *
   * @type {string}
   * @default "Date"
   */
  dateLabel?: string;

  /**
   * Label text for the time picker field.
   * Only displayed when showTime is true.
   *
   * @type {string}
   * @default "Time"
   */
  timeLabel?: string;

  /**
   * Error message to display below the date picker.
   * When provided, the field will be styled in an error state.
   *
   * @type {string}
   * @example
   * error="Date is required"
   * error={formErrors.appointmentDate?.message}
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
   * Prevents user interaction with both date and time inputs.
   *
   * @type {boolean}
   * @default false
   */
  disabled?: boolean;

  /**
   * Name attribute for the hidden input element.
   * Used for form submission - the value will be in ISO string format.
   *
   * @type {string}
   * @example
   * name="appointmentDate"
   * // Form data will contain: appointmentDate: "2025-01-01T14:30:00.000Z"
   */
  name?: string;

  /**
   * ID attribute for the date picker button.
   * Also used as a base for the time input ID (suffixed with '-time').
   *
   * @type {string}
   */
  id?: string;

  /**
   * Minimum selectable date.
   * Dates before this will be disabled in the calendar.
   *
   * @type {Date}
   * @example
   * minDate={new Date()} // Disable past dates
   * minDate={startDate}  // Ensure end date is after start date
   */
  minDate?: Date;

  /**
   * Maximum selectable date.
   * Dates after this will be disabled in the calendar.
   *
   * @type {Date}
   * @example
   * maxDate={new Date(2025, 11, 31)} // Disable dates after Dec 31, 2025
   */
  maxDate?: Date;

  /**
   * Array of specific dates to disable in the calendar.
   * Useful for blocking out holidays, booked dates, etc.
   *
   * @type {Date[]}
   * @example
   * disabledDates={[
   *   new Date(2025, 0, 1),  // New Year's Day
   *   new Date(2025, 11, 25), // Christmas
   * ]}
   */
  disabledDates?: Date[];

  /**
   * CSS class name for the root container element.
   *
   * @type {string}
   */
  className?: string;

  /**
   * CSS class name for the date picker button.
   *
   * @type {string}
   * @example
   * dateClassName="w-64"
   */
  dateClassName?: string;

  /**
   * CSS class name for the time picker input wrapper.
   *
   * @type {string}
   * @example
   * timeClassName="w-32"
   */
  timeClassName?: string;
}

/**
 * DateTimePicker Component
 *
 * A reusable date and time picker component that combines a calendar popover with an optional time input.
 * Supports controlled component patterns, form integration, and validation. Extended from shadcnui's
 * [DateTime Picker example](https://ui.shadcn.com/docs/components/radix/date-picker#time-picker)
 *
 * @component
 * @example
 * // Basic date picker
 * <DateTimePicker
 *   value={date}
 *   onChange={setDate}
 *   placeholder="Select a date"
 * />
 *
 * @example
 * // Date and time picker with validation
 * <DateTimePicker
 *   value={appointmentDate}
 *   onChange={setAppointmentDate}
 *   showTime
 *   required
 *   error={errors.appointmentDate}
 *   name="appointmentDate"
 * />
 *
 * @example
 * // With date constraints
 * <DateTimePicker
 *   value={eventDate}
 *   onChange={setEventDate}
 *   minDate={new Date()}
 *   maxDate={new Date(2025, 11, 31)}
 *   disabledDates={[new Date(2025, 0, 1)]}
 * />
 */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DateTimePicker({
  value,
  onChange,
  showTime = false,
  dateFormat = "PPP",
  placeholder = "Select date",
  dateLabel = "Date",
  timeLabel = "Time",
  error,
  required = false,
  disabled = false,
  name,
  id,
  minDate,
  maxDate,
  disabledDates,
  className,
  dateClassName,
  timeClassName,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    value,
  );

  // Sync internal state with external value
  React.useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setInternalDate(undefined);
      onChange?.(undefined);
      setOpen(false);
      return;
    }

    // If we have existing date with time, preserve the time
    if (internalDate && showTime) {
      const newDate = new Date(selectedDate);
      newDate.setHours(internalDate.getHours());
      newDate.setMinutes(internalDate.getMinutes());
      newDate.setSeconds(internalDate.getSeconds());
      setInternalDate(newDate);
      onChange?.(newDate);
    } else {
      setInternalDate(selectedDate);
      onChange?.(selectedDate);
    }

    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (!timeValue || !internalDate) return;

    const [hours, minutes, seconds = "0"] = timeValue.split(":");
    const newDate = new Date(internalDate);
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    newDate.setSeconds(parseInt(seconds, 10));

    setInternalDate(newDate);
    onChange?.(newDate);
  };

  const timeValue = internalDate
    ? `${internalDate.getHours().toString().padStart(2, "0")}:${internalDate
        .getMinutes()
        .toString()
        .padStart(
          2,
          "0",
        )}:${internalDate.getSeconds().toString().padStart(2, "0")}`
    : "";

  return (
    <div className={className}>
      <FieldGroup className={showTime ? "flex-row gap-4" : ""}>
        {/* Date Picker */}
        <Field>
          {dateLabel && (
            <FieldLabel htmlFor={id || name}>
              {dateLabel}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                id={id || name}
                disabled={disabled}
                className={`justify-between font-normal ${dateClassName || ""}`}
              >
                {internalDate ? format(internalDate, dateFormat) : placeholder}
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={internalDate}
                captionLayout="dropdown"
                defaultMonth={internalDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  if (minDate && startOfDay(date) < startOfDay(minDate)) return true;
                  if (maxDate && startOfDay(date) > startOfDay(maxDate)) return true;
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
            </PopoverContent>
          </Popover>
          {error && <FieldError>{error}</FieldError>}
        </Field>

        {/* Time Picker (Optional) */}
        {showTime && (
          <Field className={timeClassName}>
            <FieldLabel htmlFor={`${id || name}-time`}>{timeLabel}</FieldLabel>
            <Input
              type="time"
              id={`${id || name}-time`}
              step="1"
              value={timeValue}
              onChange={handleTimeChange}
              disabled={disabled || !internalDate}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </Field>
        )}
      </FieldGroup>

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={internalDate ? internalDate.toISOString() : ""}
        />
      )}
    </div>
  );
}
