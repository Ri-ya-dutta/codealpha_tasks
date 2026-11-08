const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const {
    getAdminStats,
    getAllUsers
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);

module.exports = router;
