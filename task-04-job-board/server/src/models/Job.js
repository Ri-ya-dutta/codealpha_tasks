const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        employer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        jobType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "internship"],
            required: true
        },
        experienceLevel: {
            type: String,
            enum: ["entry", "junior", "mid", "senior"],
            default: "entry"
        },
        salaryMin: Number,
        salaryMax: Number,
        skills: [String],
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
