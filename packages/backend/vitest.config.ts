import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Set test environment
    environment: "node",
    env: {
      NODE_ENV: "test",
      POSTGRES_CONNECTION_STRING:
        "postgres://postgres:postgres@localhost:5432/postgres",
    },
  },
});
