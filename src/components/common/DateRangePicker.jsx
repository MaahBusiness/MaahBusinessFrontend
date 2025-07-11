import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const DateRangePicker = ({ startDate, endDate, setStartDate, setEndDate }) => {
  const handleStartDateChange = (newValue) => {
    if (newValue?.isValid()) {
      setStartDate(newValue.format("YYYY-MM-DD")); // From Datepicker and input[date]
    }
  };

  const handleEndDateChange = (newValue) => {
    if (newValue?.isValid()) {
      setEndDate(newValue.format("YYYY-MM-DD"));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        className="date-range-filter"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div className="date-input-container">
          {/* <label>From</label> */}
          <DatePicker
            sx={{ maxWidth: "150px" }}
            value={dayjs(startDate)}
            onChange={handleStartDateChange}
            format="DD-MM-YYYY" // For display
            slotProps={{ textField: { size: "small" } }}
          />
        </div>
        <span>-</span>
        <div className="date-input-container">
          {/* <label>To</label> */}
          <DatePicker
            sx={{ maxWidth: "150px" }}
            value={dayjs(endDate)}
            onChange={handleEndDateChange}
            format="DD-MM-YYYY"
            slotProps={{ textField: { size: "small" } }}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
