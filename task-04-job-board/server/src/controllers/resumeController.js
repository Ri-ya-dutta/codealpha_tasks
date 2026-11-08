const Resume = require("../models/Resume");

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume"
            });
        }

        const resume = await Resume.create({
            candidate: req.user._id,
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size
        });

        res.status(201).json({
            success: true,
            message: "Resume uploaded successfully",
            resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMyResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({
            candidate: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resumes.length,
            resumes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
