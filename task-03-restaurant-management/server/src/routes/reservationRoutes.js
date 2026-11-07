
const express = require("express");
const router = express.Router();

const {
    createReservation,
    getReservations,
    cancelReservation
} = require("../controllers/reservationController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", createReservation);
router.get("/", protect, adminOnly, getReservations);
router.patch("/:id/cancel", protect, adminOnly, cancelReservation);

module.exports = router;
