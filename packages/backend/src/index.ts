import express from "express";
import { authMiddleware } from "./auth/middleware";
import { redirectHandler } from "./auth/redirect.handler";
import { singpassAuthUrlHandler } from "./auth/singpass/auth-url.handler";
import {
  getCaregiverSelfHandler,
  insertCaregiverHandler,
  updateCaregiverSelfHandler,
} from "./caregiver/caregiver.handler";
import {
  getEldersDetailsHandler,
  insertElderHandler,
  updateElderHandler,
  getInviteLinkHandler,
  createElderRelationshipHandler,
  getElderDetailsHandler,
} from "./elder/elder.handler";
import { corsWithConfig } from "./misc/cors";

import {
  createAppointmentHandler,
  getAppointmentsHandler,
} from "./appointment/appointment.handler";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(corsWithConfig());

app.use(express.json()); // for parsing application/json

app.use(express.static("./dist/static"));

app.use((req, res, next) => {
  // check if the request is for the frontend
  if (req.path.startsWith("/api")) {
    next(); // continue to the next middleware
  } else {
    // if not, serve the index.html file
    res.sendFile("index.html", {
      root: "./dist/static",
    });
  }
});

app.get("/api/singpass/auth-url", singpassAuthUrlHandler);
app.get("/api/redirect", redirectHandler);

// require authentication for routes here
app.use(authMiddleware());

app.get("/api/caregiver/self", getCaregiverSelfHandler);
app.post("/api/caregiver/self", insertCaregiverHandler);
app.patch("/api/caregiver/self", updateCaregiverSelfHandler);

app.get("/api/elder/details", getEldersDetailsHandler);
app.get("/api/elder/details/:elderId", getElderDetailsHandler);
app.post("/api/elder/new", insertElderHandler);
app.patch("/api/elder/:elderId", updateElderHandler);

app.get("/api/elder/invite", getInviteLinkHandler);
app.post("/api/elder/invite", createElderRelationshipHandler);

app.post("/api/appointment", createAppointmentHandler);
app.get("/api/appointments", getAppointmentsHandler);

app.listen(port, () => {
  console.log(`🚀 Carely listening on port ${port}`);
});

export default app;
