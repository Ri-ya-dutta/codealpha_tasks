
const express = require("express");
const router = express.Router();

const {
    getTables,
    createTable,
    updateTable
} = require("../controllers/tableController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getTables);
router.post("/", protect, adminOnly, createTable);
router.patch("/:id", protect, adminOnly, updateTable);

module.exports = router;
