
const express = require("express");
const router = express.Router();

const {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require("../controllers/menuController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getMenu);
router.post("/", protect, adminOnly, createMenuItem);
router.put("/:id", protect, adminOnly, updateMenuItem);
router.delete("/:id", protect, adminOnly, deleteMenuItem);

module.exports = router;
