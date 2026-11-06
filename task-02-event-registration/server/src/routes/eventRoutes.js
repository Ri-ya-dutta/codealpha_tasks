
import express from "express";

import {
  createEvent,
  getAllEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  cancelEvent,
} from "../controllers/eventController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all upcoming events (Public)
router.get("/", getAllEvents);

// Get events belonging to the logged-in organizer or all events for admin
// This route must be before /:id
router.get(
  "/my-events",
  protect,
  authorizeRoles("organizer", "admin"),
  getMyEvents
);

// Get a single event by ID (Public)
router.get("/:id", getEventById);

// Create an event (Organizer or Admin only)
router.post(
  "/",
  protect,
  authorizeRoles("organizer", "admin"),
  createEvent
);

// Update an event (Organizer or Admin only)
router.put(
  "/:id",
  protect,
  authorizeRoles("organizer", "admin"),
  updateEvent
);

// Cancel an event (Organizer or Admin only)
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("organizer", "admin"),
  cancelEvent
);

export default router;
