import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Set test environment
    environment: "node",
    env: {
      NODE_ENV: "test",
      // Default to a non-listening port to avoid accidental local DB connection
      POSTGRES_CONNECTION_STRING:
        process.env.POSTGRES_CONNECTION_STRING ||
        "postgres://postgres:postgres@localhost:65432/postgres",
    },
  },
});
