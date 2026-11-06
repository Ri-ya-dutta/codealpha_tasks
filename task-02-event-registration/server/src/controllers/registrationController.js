import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

// @desc    Register a user for an event
// @route   POST /api/registrations/:eventId
// @access  Logged-in users
export const registerForEvent = async (req, res) => {
  const session = await mongoose.startSession();

  let response;
  let statusCode = 201;

  try {
    const { eventId } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    await session.withTransaction(async () => {
      // Check whether the event exists
      const event = await Event.findById(eventId).session(session);

      if (!event) {
        response = {
          success: false,
          message: "Event not found",
        };
        statusCode = 404;
        throw new Error("REGISTRATION_ABORT");
      }

      // Check event status
      if (event.status !== "upcoming") {
        response = {
          success: false,
          message: "This event is not available for registration",
        };
        statusCode = 400;
        throw new Error("REGISTRATION_ABORT");
      }

      if (event.date <= new Date()) {
        response = {
          success: false,
          message: "Registration for this event is closed",
        };
        statusCode = 400;
        throw new Error("REGISTRATION_ABORT");
      }

      // Prevent duplicate active registrations
      const existingRegistration = await Registration.findOne({
        user: req.user._id,
        event: eventId,
      }).session(session);

      if (existingRegistration?.status === "confirmed") {
        response = {
          success: false,
          message: "You are already registered for this event",
        };
        statusCode = 409;
        throw new Error("REGISTRATION_ABORT");
      }

      // Atomically reserve one available seat
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          status: "upcoming",
          date: { $gt: new Date() },
          $expr: { $lt: ["$registeredCount", "$capacity"] },
        },
        {
          $inc: { registeredCount: 1 },
        },
        {
          returnDocument: "after",
          session,
        }
      );

      if (!updatedEvent) {
        response = {
          success: false,
          message: "Sorry, this event is fully booked",
        };
        statusCode = 400;
        throw new Error("REGISTRATION_ABORT");
      }

      // Reactivate an old registration or create a new one
      if (existingRegistration) {
        existingRegistration.status = "confirmed";
        existingRegistration.registeredAt = new Date();
        await existingRegistration.save({ session });
      } else {
        await Registration.create(
          [
            {
              user: req.user._id,
              event: eventId,
              status: "confirmed",
            },
          ],
          { session }
        );
      }

      response = {
        success: true,
        message: "Event registration successful",
        registration: {
          user: req.user._id,
          event: eventId,
          status: "confirmed",
        },
        availableSeats: updatedEvent.capacity - updatedEvent.registeredCount,
      };
    });

    return res.status(statusCode).json(response);
  } catch (error) {
    if (error.message === "REGISTRATION_ABORT") {
      return res.status(statusCode).json(response);
    }

    console.error("Event registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to register for event",
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Get all registrations of the logged-in user
// @route   GET /api/registrations/my-registrations
// @access  Logged-in users
export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
    })
      .populate(
        "event",
        "title description category date venue status"
      )
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Get my registrations error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your registrations",
    });
  }
};

// @desc    Cancel a user's event registration
// @route   DELETE /api/registrations/:eventId
// @access  Logged-in users
export const cancelRegistration = async (req, res) => {
  const session = await mongoose.startSession();

  let response;
  let statusCode = 200;

  try {
    const { eventId } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    await session.withTransaction(async () => {
      // Find the user's registration for this event
      const registration = await Registration.findOne({
        user: req.user._id,
        event: eventId,
      }).session(session);

      if (!registration) {
        response = {
          success: false,
          message: "You are not registered for this event",
        };
        statusCode = 404;
        throw new Error("CANCELLATION_ABORT");
      }

      if (registration.status === "cancelled") {
        response = {
          success: false,
          message: "Your registration is already cancelled",
        };
        statusCode = 400;
        throw new Error("CANCELLATION_ABORT");
      }

      // Mark registration as cancelled
      registration.status = "cancelled";
      await registration.save({ session });

      // Decrease the event's registered count
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          registeredCount: { $gt: 0 },
        },
        {
          $inc: { registeredCount: -1 },
        },
        {
          returnDocument: "after",
          session,
        }
      );

      if (!updatedEvent) {
        throw new Error("EVENT_COUNT_UPDATE_FAILED");
      }

      response = {
        success: true,
        message: "Registration cancelled successfully",
        registration: {
          id: registration._id,
          event: eventId,
          status: "cancelled",
        },
        availableSeats: updatedEvent.capacity - updatedEvent.registeredCount,
      };
    });

    return res.status(statusCode).json(response);
  } catch (error) {
    if (error.message === "CANCELLATION_ABORT") {
      return res.status(statusCode).json(response);
    }

    console.error("Cancel registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel registration",
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Get all registrations for a specific event
// @route   GET /api/registrations/event/:eventId
// @access  Organizer and Admin
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Check whether the event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Organizers can only view registrations for their own events
    if (
      req.user.role === "organizer" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view registrations for your own events",
      });
    }

    // Fetch registrations and participant details
    const registrations = await Registration.find({
      event: eventId,
    })
      .populate("user", "name email")
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
      },
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Get event registrations error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event registrations",
    });
  }
};

// @desc    Get registration statistics for an event
// @route   GET /api/registrations/event/:eventId/statistics
// @access  Organizer and Admin
export const getEventStatistics = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Find the event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check organizer ownership
    if (
      req.user.role === "organizer" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view statistics for your own events",
      });
    }

    // Count confirmed and cancelled registrations
    const [confirmedCount, cancelledCount] = await Promise.all([
      Registration.countDocuments({
        event: eventId,
        status: "confirmed",
      }),
      Registration.countDocuments({
        event: eventId,
        status: "cancelled",
      }),
    ]);

    const totalRegistrations = confirmedCount + cancelledCount;

    const availableSeats = Math.max(
      0,
      event.capacity - event.registeredCount
    );

    const registrationPercentage =
      event.capacity > 0
        ? Number(
            ((event.registeredCount / event.capacity) * 100).toFixed(2)
          )
        : 0;

    res.status(200).json({
      success: true,
      statistics: {
        eventTitle: event.title,
        capacity: event.capacity,
        totalRegistrations,
        confirmedRegistrations: confirmedCount,
        cancelledRegistrations: cancelledCount,
        availableSeats,
        registrationPercentage,
      },
    });
  } catch (error) {
    console.error("Get event statistics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event statistics",
    });
  }
};
