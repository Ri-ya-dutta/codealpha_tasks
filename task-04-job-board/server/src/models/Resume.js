const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        mimeType: String,
        size: Number
    },
    { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
