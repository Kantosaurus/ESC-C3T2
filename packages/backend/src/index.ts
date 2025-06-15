import express from "express";
import { authMiddleware } from "#auth/middleware.ts";
import { corsWithConfig } from "#misc/cors.ts";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(corsWithConfig());

app.get("/", authMiddleware);

app.listen(port, () => {
  console.log(`🚀 Example app listening on port ${port}`);
});
