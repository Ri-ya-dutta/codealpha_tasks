
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

const getDailySales = async (req, res) => {
    try {
        const now = new Date();
        const start = new Date(now);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);

        const result = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lt: end },
                    paymentStatus: "paid"
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            date: start.toISOString().split("T")[0],
            totalSales: result[0]?.totalSales || 0,
            totalOrders: result[0]?.totalOrders || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStockAlerts = async (req, res) => {
    try {
        const items = await Inventory.find({
            $expr: { $lte: ["$quantity", "$minimumStock"] }
        });

        res.json({
            success: true,
            alertCount: items.length,
            alerts: items
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDailySales, getStockAlerts };
