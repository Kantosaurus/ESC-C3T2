import pgplib from "pg-promise";

/**
 * https://vitaly-t.github.io/pg-promise/module-pg-promise.html
 */
const pgp = pgplib();

const connectionString =
  process.env.POSTGRES_CONNECTION_STRING ??
  "postgres://postgres:postgres@localhost:5432/postgres";

const db = pgp(connectionString);

export { db };
