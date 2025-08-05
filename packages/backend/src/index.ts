import express from "express";
import { authMiddleware } from "./auth/middleware";
import { redirectHandler } from "./auth/redirect.handler";
import { singpassAuthUrlHandler } from "./auth/singpass/auth-url.handler";
import {
  getCaregiverSelfHandler,
  insertCaregiverHandler,
  updateCaregiverSelfHandler,
  getCaregiverById,
} from "./caregiver/caregiver.handler";
import {
  getEldersDetailsHandler,
  insertElderHandler,
  updateElderHandler,
  getInviteLinkHandler,
  createElderRelationshipHandler,
  getElderDetailsHandler,
} from "./elder/elder.handler";
import {
  deleteNotesHandler,
  getNotesHandler,
  getSingleNoteHandler,
  insertNotesHandler,
  updateNotesHandler,
} from "#note/note.handler.js";
import { corsWithConfig } from "./misc/cors";
import {
  createAppointmentHandler,
  getAppointmentsHandler,
  getAppointmentHandler,
  deleteAppointmentHandler,
  updateAppointmentHandler,
  getPendingAppointmentsHandler,
  acceptAppointmentHandler,
} from "./appointment/appointment.handler";
import { getUpcomingAppointmentsHandler } from "#dashboard/upcoming-appointments.handler.js";

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

app.get("/api/caregiver/:caregiver_id", getCaregiverById);

app.get("/api/elder/details", getEldersDetailsHandler);
app.get("/api/elder/details/:elderId", getElderDetailsHandler);
app.post("/api/elder/new", insertElderHandler);
app.patch("/api/elder/:elderId", updateElderHandler);

app.get("/api/elder/invite", getInviteLinkHandler);
app.post("/api/elder/invite", createElderRelationshipHandler);

app.post("/api/appointment/accept", acceptAppointmentHandler);
app.post("/api/appointment/new", createAppointmentHandler);
app.get("/api/appointments/:elder_id", getAppointmentsHandler);
app.get("/api/appointment/:elder_id/:appt_id", getAppointmentHandler);
app.post("/api/appointment/delete", deleteAppointmentHandler);
app.patch("/api/appointment/update", updateAppointmentHandler);
app.get("/api/appointment/pending", getPendingAppointmentsHandler);

app.get("/api/notes/details", getNotesHandler);
app.get("/api/notes/:id", getSingleNoteHandler);
app.post("/api/notes/new", insertNotesHandler);
app.post("/api/notes/:id/delete", deleteNotesHandler);
app.patch("/api/notes/:id", updateNotesHandler);

app.get("/api/dashboard/upcoming-appointments", getUpcomingAppointmentsHandler);

app.listen(port, () => {
  console.log(`🚀 Carely listening on port ${port}`);
});

export default app;
