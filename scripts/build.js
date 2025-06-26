const exec = require("child_process").execSync;

const buildPackage = (workspace) => {
  console.log(`Building package: ${workspace}`);
  exec(`npm run build --workspace=${workspace}`, { stdio: "inherit" });
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

if (require.main === module) {
  buildAll();
}
