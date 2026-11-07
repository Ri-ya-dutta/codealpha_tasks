
const MenuItem = require("../models/MenuItem");

const getMenu = async (req, res) => {
    try {
        const menu = await MenuItem.find()
            .populate("ingredients.inventoryItem", "name unit quantity");

        res.json({ success: true, count: menu.length, menu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.create(req.body);
        res.status(201).json({
            success: true,
            message: "Menu item created",
            item
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.json({ success: true, item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.json({ success: true, message: "Menu item deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
