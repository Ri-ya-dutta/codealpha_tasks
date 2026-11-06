import express from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login an existing user
router.post("/login", loginUser);

// Get the currently logged-in user's profile
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
