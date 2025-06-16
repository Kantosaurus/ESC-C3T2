const { migrate } = require("postgres-migrations");

function runMigrations() {
  const dbConfig = {
    database: "postgres",
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,

    // Default: false for backwards-compatibility
    // This might change!
    ensureDatabaseExists: true,

    // Default: "postgres"
    // Used when checking/creating "database-name"
    defaultDatabase: "postgres",
  };

  return migrate(dbConfig, "./migrations");
}

runMigrations().then(
  (migrations) => {
    console.log("🚀 Migrations completed successfully.");
    console.log("Applied migrations:", migrations);
  },
  (error) => {
    console.error("Error running migrations:", error);
  }
);
