import express from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "./auth/middleware";
import { redirectHandler } from "./auth/redirect.handler";
import { singpassAuthUrlHandler } from "./auth/singpass/auth-url.handler";
import {
  getCaregiverSelfHandler,
  insertCaregiverHandler,
  updateCaregiverSelfHandler,
  deleteCaregiverHandler,
  getCaregiverById,
  getCaregiversByElderIdHandler,
  getCaregiverProfileHandler,
} from "./caregiver/caregiver.handler";
import {
  getEldersDetailsHandler,
  insertElderHandler,
  updateElderHandler,
  deleteElderHandler,
  getInviteLinkHandler,
  createElderRelationshipHandler,
  getElderDetailsHandler,
} from "./elder/elder.handler";
import {
  deleteNotesHandler,
  getNotesHandler,
  getNoteByIdHandler,
  insertNotesHandler,
  updateNotesHandler,
  getNotesByElderIdHandler,
} from "#note/note.handler.js";
import { corsWithConfig } from "./misc/cors";
import {
  createAppointmentHandler,
  getAppointmentsHandler,
  getAppointmentHandler,
  deleteAppointmentHandler,
  updateAppointmentHandler,
  getPendingAppointmentsHandler,
  getAllAppointmentsForCaregiverHandler,
  importIcsFileHandler,
  acceptAppointmentHandler,
} from "./appointment/appointment.handler";
import { getUpcomingAppointmentsHandler } from "#dashboard/upcoming-appointments.handler.js";
import { chatHandler } from "./ai/ai.handler.js";
import { cleanupExpiredSessions } from "./auth/session.entity";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(corsWithConfig());

// Rate limiting to prevent abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // More generous in development
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 100, // More generous in development
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all API routes
app.use("/api", generalLimiter);

// Set reasonable payload limits to prevent DoS attacks
app.use(
  express.json({
    limit: "2mb", // Reduced from 10mb - sufficient for profile pictures after compression
  })
);
app.use(
  express.urlencoded({
    limit: "1mb", // Form data should be much smaller than JSON with base64 images
    extended: true,
    parameterLimit: 100, // Limit number of parameters to prevent parsing DoS
  })
);

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

// Apply stricter rate limiting to authentication endpoints
app.get("/api/singpass/auth-url", authLimiter, singpassAuthUrlHandler);
app.get("/api/redirect", authLimiter, redirectHandler);

// require authentication for routes here
app.use(authMiddleware());

app.get("/api/caregiver/self", getCaregiverSelfHandler);
app.post("/api/caregiver/self", insertCaregiverHandler);
app.patch("/api/caregiver/self", updateCaregiverSelfHandler);
app.delete("/api/caregiver/self", deleteCaregiverHandler);

app.get("/api/caregiver/:caregiver_id", getCaregiverById);
app.get("/api/caregiver/profile/:caregiver_id", getCaregiverProfileHandler);
app.get("/api/caregiver/elder/:elderId", getCaregiversByElderIdHandler);

app.get("/api/elder/details", getEldersDetailsHandler);
app.get("/api/elder/details/:elderId", getElderDetailsHandler);
app.post("/api/elder/new", insertElderHandler);
app.patch("/api/elder/:elderId", updateElderHandler);
app.delete("/api/elder/:elderId", deleteElderHandler);

app.get("/api/elder/invite", getInviteLinkHandler);
app.post("/api/elder/invite", createElderRelationshipHandler);

app.post("/api/appointment/accept", acceptAppointmentHandler);
app.post("/api/appointment/new", createAppointmentHandler);
app.get("/api/appointments/:elder_id", getAppointmentsHandler);
app.get("/api/appointment/:elder_id/:appt_id", getAppointmentHandler);
app.post("/api/appointment/delete", deleteAppointmentHandler);
app.patch("/api/appointment/update", updateAppointmentHandler);
app.get("/api/appointment/pending", getPendingAppointmentsHandler);
app.get("/api/appointment/all", getAllAppointmentsForCaregiverHandler);
app.post("/api/appointment/import-ics", importIcsFileHandler);

app.get("/api/notes/details", getNotesHandler);
app.get("/api/notes/:id", getNoteByIdHandler);
app.get("/api/notes/elder/:elderId", getNotesByElderIdHandler);
app.post("/api/notes/new", insertNotesHandler);
app.post("/api/notes/delete", deleteNotesHandler);
app.post("/api/notes/edit", updateNotesHandler);

app.get("/api/dashboard/upcoming-appointments", getUpcomingAppointmentsHandler);

app.post("/api/ai/chat", chatHandler);

// Set up periodic session cleanup (every 15 minutes)
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const startSessionCleanup = () => {
  setInterval(async () => {
    try {
      const cleanedCount = await cleanupExpiredSessions();
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired sessions`);
      }
    } catch (error) {
      console.error("Session cleanup failed:", error);
    }
  }, CLEANUP_INTERVAL_MS);
};

app.listen(port, () => {
  console.log(`🚀 Carely listening on port ${port}`);

  // Start session cleanup after server starts
  startSessionCleanup();
});

export default app;
