import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envBuildPath = path.join(__dirname, "..", ".env.build");
const envFrontendPath = path.join(
  __dirname,
  "..",
  "packages",
  "frontend",
  ".env"
);

if (fs.existsSync(envBuildPath)) {
  const envContent = fs.readFileSync(envBuildPath, "utf-8");
  fs.writeFileSync(envFrontendPath, envContent, "utf-8");
  console.log(`✅ Copied .env.build to ${envFrontendPath}`);
} else {
  console.warn(
    `⚠️ .env.build file not found at ${envBuildPath}. Skipping copy.`
  );
}

const buildPackage = (workspace) => {
  console.log(`Building package: ${workspace}`);
  execSync(`npm run build --workspace=${workspace}`, { stdio: "inherit" });
  console.log(`✅ Finished building package: ${workspace}`);
};

const buildCore = () => buildPackage("@carely/core");
const buildFrontend = () => buildPackage("@carely/frontend");
const buildBackend = () => buildPackage("@carely/backend");

const buildAll = () => {
  buildCore();
  buildBackend();
  buildFrontend();
};

buildAll();
