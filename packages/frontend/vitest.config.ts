import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const setupFiles = ["./src/setup.test.ts"];

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles,
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: setupFiles,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
