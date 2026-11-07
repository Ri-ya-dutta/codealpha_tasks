
const Inventory = require("../models/Inventory");

const getInventory = async (req, res) => {
    try {
        const items = await Inventory.find().sort({ name: 1 });
        res.json({ success: true, count: items.length, items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json({
            success: true,
            message: "Inventory item added",
            item
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { quantity, minimumStock, unit } = req.body;

        const item = await Inventory.findByIdAndUpdate(
            req.params.id,
            { quantity, minimumStock, unit },
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        res.json({ success: true, message: "Inventory updated", item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getLowStock = async (req, res) => {
    try {
        const items = await Inventory.find({
            $expr: { $lte: ["$quantity", "$minimumStock"] }
        });

        res.json({
            success: true,
            count: items.length,
            lowStockItems: items
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getInventory,
    addInventoryItem,
    updateInventory,
    getLowStock
};
