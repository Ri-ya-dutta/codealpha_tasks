const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

const {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus
} = require("../controllers/applicationController");

router.use(protect);

router.post("/", authorize("candidate"), applyForJob);
router.get("/my", authorize("candidate"), getMyApplications);

router.get(
    "/job/:jobId",
    authorize("employer"),
    getJobApplications
);

router.patch(
    "/:id/status",
    authorize("employer"),
    updateApplicationStatus
);

module.exports = router;
