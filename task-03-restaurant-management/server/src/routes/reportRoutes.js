
const express = require("express");
const router = express.Router();

const {
    getDailySales,
    getStockAlerts
} = require("../controllers/reportController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);

router.get("/daily-sales", getDailySales);
router.get("/stock-alerts", getStockAlerts);

module.exports = router;
