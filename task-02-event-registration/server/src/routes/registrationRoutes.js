import express from "express";

import {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
  getEventStatistics,
} from "../controllers/registrationController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// View all registrations of the logged-in user
router.get("/my-registrations", protect, getMyRegistrations);

// Organizer/Admin: View registration statistics
router.get(
  "/event/:eventId/statistics",
  protect,
  authorizeRoles("organizer", "admin"),
  getEventStatistics
);

// Organizer/Admin: View registrations for a specific event
router.get(
  "/event/:eventId",
  protect,
  authorizeRoles("organizer", "admin"),
  getEventRegistrations
);

// Register for an event
router.post("/:eventId", protect, registerForEvent);

// Cancel a registration
router.delete("/:eventId", protect, cancelRegistration);

export default router;
