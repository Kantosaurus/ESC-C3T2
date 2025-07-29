import { SgidClient } from "@opengovsg/sgid-client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Validate required environment variables
const requiredEnvVars = {
  SGID_CLIENT_ID: process.env.SGID_CLIENT_ID,
  SGID_CLIENT_SECRET: process.env.SGID_CLIENT_SECRET,
  SGID_PRIVATE_KEY: process.env.SGID_PRIVATE_KEY,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn("⚠️ Missing Singpass environment variables:", missingVars);
  console.warn("🔧 Please set the following environment variables:");
  missingVars.forEach((varName) => {
    console.warn(`   - ${varName}`);
  });
  console.warn("📖 See documentation for setup instructions");
}

/**
 * We will use SGID as our Singpass broker so that it's free!
 */
const singpassClient = new SgidClient({
  clientId: String(process.env.SGID_CLIENT_ID || "missing-client-id"),
  clientSecret: String(
    process.env.SGID_CLIENT_SECRET || "missing-client-secret"
  ),
  privateKey: String(process.env.SGID_PRIVATE_KEY || "missing-private-key"),
  redirectUri: `${BASE_URL}/api/redirect`,
});

export { singpassClient };
