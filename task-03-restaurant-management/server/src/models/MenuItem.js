
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    ingredients: [{
        inventoryItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0.01
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("MenuItem", menuItemSchema);
