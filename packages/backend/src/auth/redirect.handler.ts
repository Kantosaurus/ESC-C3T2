import { jwtSecret } from "./secret";
import { sessionData } from "./session";
import { singpassClient } from "./singpass/client";
import { SignJWT } from "jose";

const FRONTEND_HOST = process.env.FRONTEND_HOST || "http://localhost:3000";

export const redirectHandler = async (req, res): Promise<void> => {
  // Retrieve the authorization code and session ID
  const authCode = String(req.query.code);
  const state = String(req.query.state);
  const sessionId = new URLSearchParams(state).get("sessionId");

  if (!sessionId || !authCode) {
    res.redirect(`${FRONTEND_HOST}/error`);
    return;
  }

  // Retrieve the code verifier from memory
  const session = sessionData[sessionId];

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

  res.redirect(`${FRONTEND_HOST}/redirect?token=${encodeURIComponent(token)}`);
};
