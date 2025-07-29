import { RequestHandler } from "express";
import { getEldersDetails } from "../elder/elder.entity";
import { getNotesDetails } from "../note/note.entity";
import { getAppointmentsForElder } from "../appointment/appointment.entity";

// Define user roles
export enum UserRole {
  CAREGIVER = "caregiver",
  ADMIN = "admin", // For future use
}

// Define permissions
export enum Permission {
  READ_OWN_PROFILE = "read_own_profile",
  UPDATE_OWN_PROFILE = "update_own_profile",
  READ_ELDER_PROFILE = "read_elder_profile",
  UPDATE_ELDER_PROFILE = "update_elder_profile",
  CREATE_ELDER = "create_elder",
  DELETE_ELDER = "delete_elder",
  READ_ELDER_APPOINTMENTS = "read_elder_appointments",
  CREATE_ELDER_APPOINTMENTS = "create_elder_appointments",
  UPDATE_ELDER_APPOINTMENTS = "update_elder_appointments",
  DELETE_ELDER_APPOINTMENTS = "delete_elder_appointments",
  READ_ELDER_NOTES = "read_elder_notes",
  CREATE_ELDER_NOTES = "create_elder_notes",
  UPDATE_ELDER_NOTES = "update_elder_notes",
  DELETE_ELDER_NOTES = "delete_elder_notes",
  READ_OTHER_CAREGIVER = "read_other_caregiver", // Restricted
}

// Get user role (simplified - all users are caregivers for now)
export const getUserRole = (): UserRole => {
  return UserRole.CAREGIVER;
};

// Check if user has a specific permission
export const hasPermission = (
  _userId: string,
  permission: Permission
): boolean => {
  // For now, caregivers have all permissions except restricted ones
  return permission !== Permission.READ_OTHER_CAREGIVER;
};

// Helper function to check if user has access to an elder
export const hasElderAccess = async (
  caregiverId: string,
  elderId: number
): Promise<boolean> => {
  try {
    const elders = await getEldersDetails(caregiverId);
    return elders.some((elder) => elder.id === elderId);
  } catch {
    console.error("Error checking elder access");
    return false;
  }
};

// Helper function to check if user owns a note
export const hasNoteAccess = async (
  caregiverId: string,
  noteId: number
): Promise<boolean> => {
  try {
    const notes = await getNotesDetails(caregiverId);
    return notes.some((note) => note.id === noteId);
  } catch {
    console.error("Error checking note access");
    return false;
  }
};

// Helper function to check if user owns an appointment
export const hasAppointmentAccess = async (
  caregiverId: string,
  elderId: number,
  appointmentId: number
): Promise<boolean> => {
  try {
    // First check if user has access to the elder
    const hasAccessToElder = await hasElderAccess(caregiverId, elderId);
    if (!hasAccessToElder) {
      return false;
    }

    // Then check if the appointment exists for that elder
    const appointments = await getAppointmentsForElder(elderId);
    return appointments.some((appt) => appt.appt_id === appointmentId);
  } catch {
    console.error("Error checking appointment access");
    return false;
  }
};

// Authorization middleware factory
export const requirePermission = (permission: Permission): RequestHandler => {
  return (req, res, next) => {
    const userId = res.locals.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!hasPermission(userId, permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Authorization guard for elder access
export const requireElderAccess = (): RequestHandler => {
  return async (req, res, next) => {
    const userId = res.locals.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Extract elderId from params or body
    let elderId: number;
    try {
      if (req.params.elderId) {
        elderId = parseInt(req.params.elderId, 10);
      } else if (req.params.elder_id) {
        elderId = parseInt(req.params.elder_id, 10);
      } else if (req.body.elder_id) {
        elderId = parseInt(req.body.elder_id, 10);
      } else if (req.query.elderId) {
        elderId = parseInt(req.query.elderId as string, 10);
      } else {
        return res.status(400).json({ error: "Elder ID required" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid elder ID" });
    }

    const hasAccess = await hasElderAccess(userId, elderId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied to this elder" });
    }

    next();
  };
};

// Authorization guard for note access
export const requireNoteAccess = (): RequestHandler => {
  return async (req, res, next) => {
    const userId = res.locals.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Extract noteId from params or body
    let noteId: number;
    try {
      if (req.params.id) {
        noteId = parseInt(req.params.id, 10);
      } else if (req.body.id) {
        noteId = parseInt(req.body.id, 10);
      } else {
        return res.status(400).json({ error: "Note ID required" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const hasAccess = await hasNoteAccess(userId, noteId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied to this note" });
    }

    next();
  };
};

// Authorization guard for appointment access
export const requireAppointmentAccess = (): RequestHandler => {
  return async (req, res, next) => {
    const userId = res.locals.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Extract elderId and appointmentId from params or body
    let elderId: number;
    let appointmentId: number;

    try {
      if (req.params.elder_id && req.params.appt_id) {
        elderId = parseInt(req.params.elder_id, 10);
        appointmentId = parseInt(req.params.appt_id, 10);
      } else if (req.body.elder_id && req.body.appt_id) {
        elderId = parseInt(req.body.elder_id, 10);
        appointmentId = parseInt(req.body.appt_id, 10);
      } else {
        return res
          .status(400)
          .json({ error: "Elder ID and appointment ID required" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const hasAccess = await hasAppointmentAccess(
      userId,
      elderId,
      appointmentId
    );
    if (!hasAccess) {
      return res
        .status(403)
        .json({ error: "Access denied to this appointment" });
    }

    next();
  };
};

// Authorization guard for self-access (user can only access their own data)
export const requireSelfAccess = (): RequestHandler => {
  return (req, res, next) => {
    const userId = res.locals.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Extract target userId from params
    const targetUserId = req.params.caregiver_id || req.params.id;

    if (!targetUserId) {
      return res.status(400).json({ error: "User ID required" });
    }

    if (userId !== targetUserId) {
      return res
        .status(403)
        .json({ error: "Access denied to other users' data" });
    }

    next();
  };
};

// Type-safe authenticated request with authorization context
export type AuthenticatedRequest = {
  user: {
    userId: string;
    role: UserRole;
  };
};

// Helper to create an authenticated request context
export const createAuthContext = (userId: string): AuthenticatedRequest => ({
  user: {
    userId,
    role: getUserRole(),
  },
});
