import express from "express";
import { authMiddleware } from "#auth/middleware.ts";
import { corsWithConfig } from "#misc/cors.ts";
import { authenticated } from "#auth/guard.ts";
import {
  getCaregiverSelfHandler,
  insertCaregiverHandler,
} from "#caregiver/caregiver.handler.ts";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(corsWithConfig());

app.use(express.json()); // for parsing application/json

// require authentication for routes here
app.use(authMiddleware());

app.get(
  "/api/test/",
  authenticated((_, res) => {
    res.json(
      `hello from the backend, your user id is ${res.locals.user.userId}`
    );
  })
);

app.get("/api/caregiver/self", getCaregiverSelfHandler);
app.post("/api/caregiver/self", insertCaregiverHandler);

app.listen(port, () => {
  console.log(`🚀 Carely listening on port ${port}`);
});

export default app;
