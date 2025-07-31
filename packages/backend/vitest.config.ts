import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // ... Specify options here.
    env: {
      POSTGRES_CONNECTION_STRING:
        "postgres://postgres:postgres@localhost:5432/postgres",
    },
  },
});
