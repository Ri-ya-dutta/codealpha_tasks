
const RestaurantTable = require("../models/RestaurantTable");

const getTables = async (req, res) => {
    try {
        const tables = await RestaurantTable.find().sort({ tableNumber: 1 });
        res.json({ success: true, count: tables.length, tables });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createTable = async (req, res) => {
    try {
        const table = await RestaurantTable.create(req.body);
        res.status(201).json({
            success: true,
            message: "Table created",
            table
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateTable = async (req, res) => {
    try {
        const table = await RestaurantTable.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found"
            });
        }

        res.json({ success: true, table });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { getTables, createTable, updateTable };
