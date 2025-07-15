import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const DatePickerBasic = ({ value, onChange, id, name, className }) => {
  const defaultDate = new Date().toISOString().split("T")[0];
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        key={id}
        name={name}
        className={className}
        sx={{ width: "100%" }}
        value={dayjs(value)}
        onChange={onChange}
        format="DD-MM-YYYY" // For display
        slotProps={{ textField: { size: "small" } }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerBasic;
