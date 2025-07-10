import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6366f1",
      light: "#a5b4fc",
      dark: "#0b3899",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9c27b0",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
          borderRadius: 10,
          "&.Mui-disabled": {
            color: "#aaa",
            backgroundColor: "#333",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
