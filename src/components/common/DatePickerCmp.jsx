import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const DatePickerCmp = ({ searchDate, setSearchDate }) => {
  const handleSearchDateChange = (newValue) => {
    if (newValue?.isValid()) {
      setSearchDate(newValue.format("YYYY-MM-DD")); // From Datepicker and input[date]
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        // sx={{ minWidth: "190px" }}
        value={dayjs(searchDate)}
        onChange={handleSearchDateChange}
        format="DD-MM-YYYY" // For display
        slotProps={{ textField: { size: "small" } }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerCmp;
