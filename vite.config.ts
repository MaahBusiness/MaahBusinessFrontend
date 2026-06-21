import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    // Lint on production build only — dev linting can destabilize HMR/CSS reload.
    eslint({ dev: false, build: true, lintOnStart: false }),
  ],
  css: {
    devSourcemap: true,
  },
  build: {
    // Single CSS bundle — fewer failure modes in production.
    cssCodeSplit: false,
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
    },
  },
});
