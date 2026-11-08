const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
    uploadResume,
    getMyResumes
} = require("../controllers/resumeController");

router.use(protect, authorize("candidate"));

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/my", getMyResumes);

module.exports = router;
