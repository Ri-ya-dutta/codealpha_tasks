
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const seedAdmin = async () => {
    try {
        await connectDB();

        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error("Admin environment variables are missing");
        }

        const existingAdmin = await User.findOne({
            email: ADMIN_EMAIL.toLowerCase()
        });

        if (existingAdmin) {
            existingAdmin.name = ADMIN_NAME;
            existingAdmin.password = ADMIN_PASSWORD;
            existingAdmin.role = "admin";

            await existingAdmin.save();

            console.log("Existing admin account updated successfully");
            return;
        }

        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: "admin"
        });

        console.log("Admin account created successfully");
    } catch (error) {
        console.error("Admin seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin();
