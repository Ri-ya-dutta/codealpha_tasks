const express = require("express");
const router = express.Router();

const {
  getInventory,
  addInventoryItem,
  updateInventory,
  getLowStock,
} = require("../controllers/inventoryController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// View all inventory
router.get("/", getInventory);

// Add new inventory stock
router.post("/", protect, adminOnly, addInventoryItem);

// View low-stock items
router.get("/low-stock", protect, adminOnly, getLowStock);

// Update inventory
router.patch("/:id", protect, adminOnly, updateInventory);

module.exports = router;
