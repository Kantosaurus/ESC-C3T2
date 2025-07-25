import crypto from "crypto";
import { generatePkcePair } from "@opengovsg/sgid-client";
import { singpassClient } from "./client";
import z from "zod/v4";
import { RequestHandler } from "express";
import { sessionData } from "../session";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export const singpassAuthUrlHandler: RequestHandler = async (req, res) => {
  // Generate a session ID
  const sessionId = crypto.randomUUID();
  const after = z.string().optional().parse(req.query.after);

  // Generate a PKCE pair
  const { codeChallenge, codeVerifier } = generatePkcePair();

  const params: Record<string, string> = { sessionId };

  if (after) {
    // If an after parameter is provided, add it to the state
    params.after = after;
  }

  // Use search params to store state so other key-value pairs can be added easily
  const state = new URLSearchParams(params);

  // Generate an authorization URL
  const { url, nonce } = singpassClient.authorizationUrl({
    state: state.toString(),
    codeChallenge,
    // Scopes that all sgID relying parties can access by default
    scope: ["openid", "myinfo.name"],
    redirectUri: `${BASE_URL}/api/redirect`,
  });

  // Store code verifier, state, and nonce
  sessionData[sessionId] = {
    state,
    nonce,
    codeVerifier,
  };

  // Return the authorization URL
  res.json({ url });
};
