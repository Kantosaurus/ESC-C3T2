/**
 * This script allows us to start all dev environments concurrently
 * It looks for scripts in the root package.json that match dev-*
 */

const concurrently = require("concurrently");

const { result } = concurrently(["npm:dev-*"], {
  prefix: "name",
  killOthers: ["failure", "success"],
  restartTries: 3,
});

result.then(
  () => {
    console.log("🟢 Done!");
  },
  () => {
    console.error("⚠️ Something went wrong");
  }
);
