
const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrders,
    confirmOrder,
    updateOrderStatus
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", createOrder);
router.get("/", protect, adminOnly, getOrders);
router.patch("/:id/confirm", protect, adminOnly, confirmOrder);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
