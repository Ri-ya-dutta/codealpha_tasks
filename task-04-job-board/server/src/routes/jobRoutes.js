const express = require("express");
const router = express.Router();

const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
} = require("../controllers/jobController");

const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getJobs);
router.get("/:id", getJobById);

// Employer routes
router.post("/", protect, authorize("employer"), createJob);
router.put("/:id", protect, authorize("employer"), updateJob);
router.delete("/:id", protect, authorize("employer"), deleteJob);

module.exports = router;
