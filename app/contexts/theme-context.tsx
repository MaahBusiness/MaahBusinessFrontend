/**
 * Theme bridge — next-themes handles SSR-safe class toggling and storage.
 * Re-exported here so existing imports keep working.
 */
export { ThemeProvider, useTheme } from "next-themes";

export type Theme = "dark" | "light" | "system";
