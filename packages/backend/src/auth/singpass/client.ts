import { SgidClient } from "@opengovsg/sgid-client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/**
 * We will use SGID as our Singpass broker so that it's free!
 */
const singpassClient = new SgidClient({
  clientId: String(process.env.SGID_CLIENT_ID),
  clientSecret: String(process.env.SGID_CLIENT_SECRET),
  privateKey: String(process.env.SGID_PRIVATE_KEY),
  redirectUri: `${BASE_URL}/api/redirect`,
});

export { singpassClient };
