
import mongoose from "mongoose";
import Event from "../models/Event.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Organizer and Admin
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      venue,
      capacity,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !date ||
      !venue ||
      capacity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All event fields are required",
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid event date",
      });
    }

    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date: eventDate,
      venue,
      capacity: Number(capacity),
      organizer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

// @desc    Get all upcoming events with search, filters and pagination
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = "asc",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
    }

    const safeLimit = Math.min(limitNumber, 100);

    if (!["asc", "desc"].includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "Sort must be either asc or desc",
      });
    }

    const currentDate = new Date();
    let parsedStartDate = null;
    let parsedEndDate = null;

    const filter = {
      status: "upcoming",
      date: { $gte: currentDate },
    };

    if (search && search.trim()) {
      const searchTerm = escapeRegex(search.trim());

      filter.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (category && category.trim()) {
      const categoryTerm = escapeRegex(category.trim());

      filter.category = {
        $regex: `^${categoryTerm}$`,
        $options: "i",
      };
    }

    if (startDate) {
      parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }

      filter.date.$gte =
        parsedStartDate > currentDate ? parsedStartDate : currentDate;
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);

      if (Number.isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date",
        });
      }

      parsedEndDate.setHours(23, 59, 59, 999);
      filter.date.$lte = parsedEndDate;
    }

    if (
      parsedStartDate &&
      parsedEndDate &&
      parsedStartDate > parsedEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    const skip = (pageNumber - 1) * safeLimit;

    const [events, totalEvents] = await Promise.all([
      Event.find(filter)
        .populate("organizer", "name")
        .sort({ date: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(safeLimit),

      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      totalEvents,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalEvents / safeLimit),
        limit: safeLimit,
        hasNextPage: pageNumber * safeLimit < totalEvents,
        hasPreviousPage: pageNumber > 1,
      },
      events,
    });
  } catch (error) {
    console.error("Get events error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// @desc    Get events belonging to the logged-in organizer
// @route   GET /api/events/my-events
// @access  Organizer and Admin
export const getMyEvents = async (req, res) => {
  try {
    // Admins can view every event.
    // Organizers can view only events created by their account.
    const filter =
      req.user.role === "admin"
        ? {}
        : { organizer: req.user._id };

    const events = await Event.find(filter)
      .populate("organizer", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get my events error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your events",
    });
  }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id)
      .populate("organizer", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get event error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Organizer (own events) and Admin
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      req.user.role === "organizer" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own events",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "date",
      "venue",
      "capacity",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (
          ["title", "description", "category", "venue"].includes(field) &&
          (typeof req.body[field] !== "string" || !req.body[field].trim())
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a non-empty string`,
          });
        }

        if (field === "date") {
          const updatedDate = new Date(req.body.date);

          if (Number.isNaN(updatedDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: "Please provide a valid event date",
            });
          }

          event.date = updatedDate;
        } else if (field === "capacity") {
          const updatedCapacity = Number(req.body.capacity);

          if (
            !Number.isInteger(updatedCapacity) ||
            updatedCapacity < 1
          ) {
            return res.status(400).json({
              success: false,
              message: "Capacity must be a positive integer",
            });
          }

          event.capacity = updatedCapacity;
        } else {
          event[field] = req.body[field].trim();
        }
      }
    }

    if (
      !Number.isInteger(Number(event.capacity)) ||
      Number(event.capacity) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    if (Number(event.capacity) < event.registeredCount) {
      return res.status(400).json({
        success: false,
        message: "Capacity cannot be less than current registrations",
      });
    }

    if (event.date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

// @desc    Cancel an event
// @route   PATCH /api/events/:id/cancel
// @access  Organizer (own events) and Admin
export const cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      req.user.role === "organizer" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own events",
      });
    }

    if (event.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Event is already cancelled",
      });
    }

    event.status = "cancelled";

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      event,
    });
  } catch (error) {
    console.error("Cancel event error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to cancel event",
    });
  }
};
