import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), eslint()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
    },
  },
});
