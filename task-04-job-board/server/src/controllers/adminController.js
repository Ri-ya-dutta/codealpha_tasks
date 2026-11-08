const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

const getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalEmployers,
            totalCandidates,
            totalJobs,
            totalApplications,
            applicationStatus
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "employer" }),
            User.countDocuments({ role: "candidate" }),
            Job.countDocuments(),
            Application.countDocuments(),
            Application.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const statusCounts = {
            pending: 0,
            reviewing: 0,
            shortlisted: 0,
            rejected: 0,
            accepted: 0
        };

        applicationStatus.forEach(item => {
            statusCounts[item._id] = item.count;
        });

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalEmployers,
                totalCandidates,
                totalJobs,
                totalApplications,
                applicationsByStatus: statusCounts
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin statistics",
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

module.exports = { getAdminStats, getAllUsers };
