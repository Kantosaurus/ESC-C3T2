import pgplib from "pg-promise";

/**
 * https://vitaly-t.github.io/pg-promise/module-pg-promise.html
 */
const pgp = pgplib();

// Use port 5433 for the test database
const connectionString =
  process.env.POSTGRES_CONNECTION_STRING ??
  "postgres://postgres:postgres@localhost:5433/esc_c3t2_test";

const testDb = pgp(connectionString);

export { testDb };
