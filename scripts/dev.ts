import fs from "fs";
import path from "path";
import concurrently from "concurrently";

/**
 * This script allows us to start all dev environments concurrently
 * It looks for scripts in the root package.json that match dev-*
 */

// Copy VITE environment variables into the frontend folder
const envPath = path.join(__dirname, "..", ".env");
const envVitePath = path.join(__dirname, "..", "packages", "frontend", ".env");

const sharedVars = fs.readFileSync(envPath, "utf-8").split("\n");

const viteVars = sharedVars.filter((line) => line.startsWith("VITE"));

fs.writeFileSync(envVitePath, viteVars.join("\n"), "utf-8");

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
