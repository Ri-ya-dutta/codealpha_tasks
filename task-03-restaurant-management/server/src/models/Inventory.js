
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    unit: {
        type: String,
        required: true,
        default: "pieces"
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    minimumStock: {
        type: Number,
        default: 5,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);
