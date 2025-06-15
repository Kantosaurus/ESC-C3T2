import express from "express";
import { authMiddleware } from "#auth/middleware.ts";
import { corsWithConfig } from "#misc/cors.ts";
import { authenticated } from "#auth/guard.ts";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(corsWithConfig());

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

app.listen(port, () => {
  console.log(`🚀 Carely listening on port ${port}`);
});

export default app;
