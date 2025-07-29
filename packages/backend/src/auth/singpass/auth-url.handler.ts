import crypto from "crypto";
import { generatePkcePair } from "@opengovsg/sgid-client";
import { singpassClient } from "./client";
import z from "zod/v4";
import { RequestHandler } from "express";
import { SessionManager } from "../session";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export const singpassAuthUrlHandler: RequestHandler = async (req, res) => {
  console.log("🔐 Singpass auth URL request received");
  console.log("📡 Request origin:", req.headers.origin);
  console.log("📡 Request method:", req.method);
  console.log("📡 Request path:", req.path);

  try {
    // Generate a session ID
    const sessionId = crypto.randomUUID();
    const after = z.string().optional().parse(req.query.after);

    console.log("🆔 Generated session ID:", sessionId);
    console.log("🔄 After parameter:", after);

    // Generate a PKCE pair
    const { codeChallenge, codeVerifier } = generatePkcePair();

    const params: Record<string, string> = { sessionId };

    if (after) {
      // If an after parameter is provided, add it to the state
      params.after = after;
    }

    // Use search params to store state so other key-value pairs can be added easily
    const state = new URLSearchParams(params);

    console.log("🔗 Generating authorization URL...");

    // Generate an authorization URL
    const { url, nonce } = singpassClient.authorizationUrl({
      state: state.toString(),
      codeChallenge,
      // Scopes that all sgID relying parties can access by default
      scope: ["openid", "myinfo.name"],
      redirectUri: `${BASE_URL}/api/redirect`,
    });

    console.log("✅ Authorization URL generated successfully");
    console.log("🔗 Redirect URI:", `${BASE_URL}/api/redirect`);

    // Store code verifier, state, and nonce in database
    await SessionManager.createSession(sessionId, {
      state,
      nonce,
      codeVerifier,
    });

    console.log("💾 Session stored in database");

    // Return the authorization URL
    res.json({ url });
    console.log("📤 Response sent successfully");
  } catch (error) {
    console.error("❌ Error in singpass auth URL handler:", error);
    res.status(500).json({
      error: "Failed to generate authentication URL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
