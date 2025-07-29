const pglib = require("pg-promise");

const pgp = pglib();

const connectionString =
  process.env.POSTGRES_CONNECTION_STRING ||
  "postgres://postgres:postgres@localhost:5432/postgres";

const db = pgp(connectionString);

// drop all the tables in the database
async function dropTables() {
  try {
    const tables = await db.any(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    );

    if (tables.length === 0) {
      console.log("No tables found in the database.");
      return;
    }

    // Use parameterized queries to prevent SQL injection
    await db.tx(async (t) => {
      for (const table of tables) {
        // Use pg-promise's parameterized query with proper escaping
        await t.none('DROP TABLE IF EXISTS "${tableName}" CASCADE', {
          tableName: table.tablename,
        });
      }
    });

    console.log("All tables dropped successfully.");
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    pgp.end();
  }
}

dropTables()
  .then(() => {
    console.log("Database cleanup completed.");
  })
  .catch((error) => {
    console.error("Error during database cleanup:", error);
  });
