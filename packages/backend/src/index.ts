import express from "express";
import { authMiddleware } from "#auth/middleware.ts";
import { corsWithConfig } from "#misc/cors.ts";
import {
  getCaregiverSelfHandler,
  insertCaregiverHandler,
} from "#caregiver/caregiver.handler.ts";
import { singpassAuthUrlHandler } from "#auth/singpass/auth-url.handler.ts";
import { redirectHandler } from "#auth/redirect.handler.ts";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(corsWithConfig());

app.use(express.json()); // for parsing application/json

app.get("/api/singpass/auth-url", singpassAuthUrlHandler);
app.get("/api/redirect", redirectHandler);

// require authentication for routes here
app.use(authMiddleware());

app.get("/api/caregiver/self", getCaregiverSelfHandler);
app.post("/api/caregiver/self", insertCaregiverHandler);

app.listen(port, () => {
  console.log(`🚀 Carely listening on port ${port}`);
});

export default app;
