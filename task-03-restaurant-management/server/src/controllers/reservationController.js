
const Reservation = require("../models/Reservation");
const RestaurantTable = require("../models/RestaurantTable");

const createReservation = async (req, res) => {
    try {
        const {
            customerName, phone, table, guests, startAt, endAt
        } = req.body;

        if (!customerName || !phone || !table || !guests || !startAt || !endAt) {
            return res.status(400).json({
                success: false,
                message: "Please provide all reservation details"
            });
        }

        const start = new Date(startAt);
        const end = new Date(endAt);

        if (Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) || end <= start) {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation time"
            });
        }

        const restaurantTable = await RestaurantTable.findById(table);

        if (!restaurantTable || restaurantTable.status === "maintenance") {
            return res.status(400).json({
                success: false,
                message: "Table is unavailable"
            });
        }

        if (guests > restaurantTable.capacity) {
            return res.status(400).json({
                success: false,
                message: "Guest count exceeds table capacity"
            });
        }

        const conflict = await Reservation.findOne({
            table,
            status: "confirmed",
            startAt: { $lt: end },
            endAt: { $gt: start }
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "Table is already reserved for this time"
            });
        }

        const reservation = await Reservation.create({
            customerName,
            phone,
            table,
            guests,
            startAt: start,
            endAt: end
        });

        res.status(201).json({
            success: true,
            message: "Table reserved successfully",
            reservation
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate("table", "tableNumber capacity")
            .sort({ startAt: 1 });

        res.json({
            success: true,
            count: reservations.length,
            reservations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status: "cancelled" },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            });
        }

        res.json({
            success: true,
            message: "Reservation cancelled",
            reservation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createReservation,
    getReservations,
    cancelReservation
};
