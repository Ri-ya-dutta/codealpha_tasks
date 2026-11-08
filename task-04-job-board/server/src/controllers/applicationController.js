const Application = require("../models/Application");
const Job = require("../models/Job");
const Resume = require("../models/Resume");
const Notification = require("../models/Notification");

// Candidate applies for a job
exports.applyForJob = async (req, res) => {
    try {
        const { jobId, resumeId, coverLetter } = req.body;

        const job = await Job.findById(jobId);

        if (!job || job.status !== "open") {
            return res.status(404).json({
                success: false,
                message: "Job not found or no longer accepting applications"
            });
        }

        const resume = await Resume.findOne({
            _id: resumeId,
            candidate: req.user._id
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        const application = await Application.create({
            job: jobId,
            candidate: req.user._id,
            resume: resumeId,
            coverLetter
        });

        // Notify the employer
        await Notification.create({
            recipient: job.employer,
            title: "New Job Application",
            message: `${req.user.name} applied for ${job.title}`,
            relatedApplication: application._id
        });

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already applied for this job"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Candidate views own applications
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            candidate: req.user._id
        })
            .populate("job")
            .populate("resume", "originalName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Employer views applications for their jobs
exports.getJobApplications = async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.jobId,
            employer: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or access denied"
            });
        }

        const applications = await Application.find({
            job: job._id
        })
            .populate("candidate", "name email")
            .populate("resume", "originalName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Employer updates application status
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "pending", "reviewing", "shortlisted", "rejected", "accepted"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status"
            });
        }

        const application = await Application.findById(req.params.id)
            .populate("job");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        if (application.job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this application"
            });
        }

        application.status = status;
        await application.save();

        await Notification.create({
            recipient: application.candidate,
            title: "Application Status Updated",
            message: `Your application for ${application.job.title} is now ${status}.`,
            relatedApplication: application._id
        });

        res.status(200).json({
            success: true,
            message: "Application status updated",
            application
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
