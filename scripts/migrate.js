const { migrate } = require("postgres-migrations");
const pg = require("pg");

/**
 * Converts a PostgreSQL connection string into a configuration object.
 * @param {string} connectionString - The PostgreSQL connection string.
 * @returns {object} - The configuration object for the database connection.
 * @throws {Error} - If the connection string is invalid or missing required parts.
 */
function connectionStringToConfig(connectionString) {
  const url = new URL(connectionString);
  return {
    database: url.pathname.slice(1) || "postgres",
    user: url.username || "postgres",
    password: url.password || "postgres",
    host: url.hostname || "localhost",
    port: url.port ? parseInt(url.port, 10) : 5432,
  };
}

async function runMigrations() {
  if (!process.env.POSTGRES_CONNECTION_STRING) {
    throw new Error("POSTGRES_CONNECTION_STRING environment variable not set");
  }

  const dbConfig = {
    // Build the database configuration from the connection string
    ...connectionStringToConfig(process.env.POSTGRES_CONNECTION_STRING.trim()),

    // Enable SSL if the environment variable is set
    ssl: process.env.POSTGRES_SSL === "true",

    // Default: false for backwards-compatibility
    // This might change!
    ensureDatabaseExists: true,

    // Default: "postgres"
    // Used when checking/creating "database-name"
    defaultDatabase: "postgres",
  };

  const client = new pg.Client(dbConfig);
  await client.connect();

  return await migrate({ client }, "./migrations");
}

runMigrations().then(
  (migrations) => {
    console.log("🚀 Migrations completed successfully.");
    console.log("Applied migrations:", migrations);
    process.exit(0);
  },
  (error) => {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
);
