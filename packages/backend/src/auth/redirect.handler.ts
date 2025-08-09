import { RequestHandler } from "express";
import { jwtSecret } from "./secret";
import { getSession, deleteSession } from "./session.entity";
import { singpassClient } from "./singpass/client";
import { SignJWT } from "jose";
import { getValidatedFrontendHost } from "../misc/url-validation";

const FRONTEND_HOST = getValidatedFrontendHost();

export const redirectHandler: RequestHandler = async (
  req,
  res
): Promise<void> => {
  // Retrieve the authorization code and session ID
  const authCode = String(req.query.code);
  const state = new URLSearchParams(String(req.query.state));
  const sessionId = state.get("sessionId");
  const after = state.get("after");

  if (!sessionId || !authCode) {
    res.redirect(`${FRONTEND_HOST}/error`);
    return;
  }

  // Retrieve the session from database
  const session = await getSession(sessionId);

  // Validate that the code verifier exists for this session
  if (!session?.codeVerifier) {
    res.redirect(`${FRONTEND_HOST}/error`);
    return;
  }

  // Exchange the authorization code and code verifier for the access token
  const { sub } = await singpassClient.callback({
    code: authCode,
    nonce: session.nonce,
    codeVerifier: session.codeVerifier,
  });

  // sign a new JWT token with the user's sub
  const token = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("carely")
    .setAudience("carely")
    .setSubject(sub)
    .setExpirationTime("2h")
    .sign(jwtSecret);

  const redirectUrl = new URL("/redirect", FRONTEND_HOST);
  redirectUrl.searchParams.set("token", token);

  if (after) {
    // If an after parameter is provided, add it to the redirect URL
    redirectUrl.searchParams.set("after", after);
  }

  // Clean up the session after successful authentication
  try {
    await deleteSession(sessionId);
  } catch (error) {
    console.error("Failed to delete session:", error);
    // Continue anyway - the session will expire naturally
  }

  res.redirect(redirectUrl.toString());
};
