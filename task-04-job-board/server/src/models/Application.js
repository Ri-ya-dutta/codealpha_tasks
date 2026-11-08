const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true
        },
        coverLetter: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "reviewing", "shortlisted", "rejected", "accepted"],
            default: "pending"
        }
    },
    { timestamps: true }
);

applicationSchema.index(
    { job: 1, candidate: 1 },
    { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);
