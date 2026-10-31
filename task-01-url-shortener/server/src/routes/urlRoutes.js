import { Router } from "express";

import {
  createShortUrl,
  getUrlDetails,
  getAllUrls,
} from "../controllers/urlController.js";

const router = Router();

// Create a new short URL
router.post("/", createShortUrl);

// Get all shortened URLs
router.get("/", getAllUrls);

// Get details of a particular short URL
router.get("/:shortCode", getUrlDetails);

export default router;