import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Adjust if your entry is elsewhere
  outDir: "../../dist",
  format: ["esm"], // Output ESM for Node
  splitting: false, // Optional: no code splitting for backend
  clean: true, // Clean dist before build
  sourcemap: true, // Helpful for debugging
  dts: true, // Generate .d.ts types
});
