const Job = require("../models/Job");

// Create job (employer only)
exports.createJob = async (req, res) => {
    try {
        const {
            title, description, location, jobType,
            experienceLevel, salaryMin, salaryMax, skills
        } = req.body;

        if (!title || !description || !location || !jobType) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, description, location and job type"
            });
        }

        const job = await Job.create({
            employer: req.user._id,
            title,
            company: req.user.companyName,
            description,
            location,
            jobType,
            experienceLevel,
            salaryMin,
            salaryMax,
            skills
        });

        res.status(201).json({
            success: true,
            message: "Job posted successfully",
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search and filter jobs
exports.getJobs = async (req, res) => {
    try {
        const {
            keyword, location, jobType,
            experienceLevel, minSalary, maxSalary
        } = req.query;

        const filter = { status: "open" };

        if (keyword) {
            filter.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { company: { $regex: keyword, $options: "i" } },
                { skills: { $regex: keyword, $options: "i" } }
            ];
        }

        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }

        if (jobType) filter.jobType = jobType;
        if (experienceLevel) filter.experienceLevel = experienceLevel;

        if (minSalary) {
            filter.salaryMax = { $gte: Number(minSalary) };
        }

        if (maxSalary) {
            filter.salaryMin = { $lte: Number(maxSalary) };
        }

        const jobs = await Job.find(filter)
            .populate("employer", "name email companyName")
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single job
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("employer", "name email companyName");

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.status(200).json({ success: true, job });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid job ID"
        });
    }
};

// Update job (owning employer only)
exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            employer: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or you do not own this job"
            });
        }

        const allowedFields = [
            "title", "description", "location", "jobType",
            "experienceLevel", "salaryMin", "salaryMax",
            "skills", "status"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                job[field] = req.body[field];
            }
        });

        await job.save();

        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            job
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete job (owning employer only)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({
            _id: req.params.id,
            employer: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or you do not own this job"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid job ID"
        });
    }
};
