import express from "express";
import { authMiddleware } from "./auth/middleware";
import { redirectHandler } from "./auth/redirect.handler";
import { singpassAuthUrlHandler } from "./auth/singpass/auth-url.handler";
import { SessionManager } from "./auth/session";
import {
  getCaregiverSelfHandler,
  insertCaregiverHandler,
  updateCaregiverSelfHandler,
  getCaregiverByIdHandler,
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
import { sanitizeRequestBody } from "./security/xss-protection";
import {
  helmetConfig,
  rateLimiter,
  authRateLimiter,
  requestSizeLimiter,
  csrfProtection,
  securityHeaders,
  securityLogging,
} from "./security/security-middleware";
import {
  validateCaregiverIdParam,
  validateElderIdParam,
  validateAppointmentParams,
  validateCreateCaregiver,
  validateUpdateCaregiver,
  validateCreateElder,
  validateUpdateElder,
  validateCreateAppointment,
  validateUpdateAppointment,
  validateCreateNote,
  validateUpdateNote,
  validateDeleteNote,
  validateDeleteAppointment,
  validateAcceptAppointment,
} from "./security/input-validation";
import { Request, Response } from "express";

const app = express();
const port = process.env.PORT ?? "3000";

// Initialize session management
SessionManager.initialize().catch((error) => {
  console.error("Failed to initialize session management:", error);
});

// Security middleware - apply in order of importance
app.use(helmetConfig); // Security headers
app.use(securityHeaders); // Additional custom security headers
app.use(securityLogging); // Security monitoring and logging

// CORS configuration
app.use(corsWithConfig());

// Request size limiting
app.use(requestSizeLimiter);

// Body parsing with size limits
app.use(express.json({ limit: "1mb" })); // for parsing application/json
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // for parsing application/x-www-form-urlencoded

// Apply XSS protection middleware to all routes
app.use(sanitizeRequestBody);

// Rate limiting - apply to all routes
app.use(rateLimiter);

// Stricter rate limiting for authentication endpoints
app.use("/api/singpass", authRateLimiter);
app.use("/api/redirect", authRateLimiter);

// CSRF protection for all non-GET requests
app.use(csrfProtection);

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

// Authentication endpoints (no CSRF protection needed)
app.get("/api/singpass/auth-url", singpassAuthUrlHandler);
app.get("/api/redirect", redirectHandler);

// require authentication for routes here
app.use(authMiddleware());

// Caregiver routes with validation
app.get("/api/caregiver/self", getCaregiverSelfHandler);
app.post(
  "/api/caregiver/self",
  validateCreateCaregiver,
  insertCaregiverHandler
);
app.patch(
  "/api/caregiver/self",
  validateUpdateCaregiver,
  updateCaregiverSelfHandler
);
app.get(
  "/api/caregiver/:caregiverId",
  validateCaregiverIdParam,
  getCaregiverByIdHandler
);

// Elder routes with validation
app.get("/api/elder/details", getEldersDetailsHandler);
app.get(
  "/api/elder/details/:elderId",
  validateElderIdParam,
  getElderDetailsHandler
);
app.post("/api/elder/new", validateCreateElder, insertElderHandler);
app.patch(
  "/api/elder/:elderId",
  validateElderIdParam,
  validateUpdateElder,
  updateElderHandler
);

app.get("/api/elder/invite", getInviteLinkHandler);
app.post("/api/elder/invite", createElderRelationshipHandler);

// Appointment routes with validation
app.post(
  "/api/appointment/accept",
  validateAcceptAppointment,
  acceptAppointmentHandler
);
app.post(
  "/api/appointment/new",
  validateCreateAppointment,
  createAppointmentHandler
);
app.get(
  "/api/appointments/:elder_id",
  validateElderIdParam,
  getAppointmentsHandler
);
app.get(
  "/api/appointment/:elder_id/:appt_id",
  validateAppointmentParams,
  getAppointmentHandler
);
app.post(
  "/api/appointment/delete",
  validateDeleteAppointment,
  deleteAppointmentHandler
);
app.patch(
  "/api/appointment/update",
  validateUpdateAppointment,
  updateAppointmentHandler
);
app.get("/api/appointment/pending", getPendingAppointmentsHandler);

// Notes routes with validation
app.get("/api/notes/details", getNotesHandler);
app.post("/api/notes/new", validateCreateNote, insertNotesHandler);
app.post("/api/notes/delete", validateDeleteNote, deleteNotesHandler);
app.post("/api/notes/edit", validateUpdateNote, updateNotesHandler);

app.get("/api/dashboard/upcoming-appointments", getUpcomingAppointmentsHandler);

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
  });
});

app.listen(port, () => {
  console.log(`🚀 Carely listening on port ${port}`);
  console.log(`🔒 Security middleware enabled`);
  console.log(
    `🛡️  Rate limiting: ${
      process.env.NODE_ENV === "production" ? "Strict" : "Development"
    }`
  );
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  SessionManager.shutdown();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  SessionManager.shutdown();
  process.exit(0);
});

export default app;
