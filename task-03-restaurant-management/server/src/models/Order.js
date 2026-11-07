
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RestaurantTable"
    },
    items: [{
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true
        },
        name: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true
        },
        lineTotal: Number
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "ready", "served", "cancelled"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid"
    },
    inventoryDeducted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
