
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RestaurantTable",
        required: true
    },
    guests: {
        type: Number,
        required: true,
        min: 1
    },
    startAt: {
        type: Date,
        required: true
    },
    endAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["confirmed", "cancelled", "completed"],
        default: "confirmed"
    }
}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);
