import Url from "../models/Url.js";
import { randomBytes } from "node:crypto";

export async function createShortUrl(req, res) {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(originalUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: "Only HTTP and HTTPS URLs are allowed",
      });
    }

    let savedUrl;

    // Retry if a randomly generated short code already exists
    for (let attempt = 0; attempt < 5; attempt++) {
      const shortCode = randomBytes(4).toString("hex");

      try {
        savedUrl = await Url.create({
          originalUrl: parsedUrl.toString(),
          shortCode,
        });

        break;
      } catch (error) {
        if (error.code === 11000 && attempt < 4) {
          continue;
        }

        throw error;
      }
    }

    if (!savedUrl) {
      return res.status(500).json({
        success: false,
        message: "Could not generate a unique short code",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: {
        originalUrl: savedUrl.originalUrl,
        shortCode: savedUrl.shortCode,
        shortUrl: `${process.env.BASE_URL}/${savedUrl.shortCode}`,
      },
    });
  } catch (error) {
    console.error("Create URL error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function redirectToOriginalUrl(req, res) {
  try {
    const { shortCode } = req.params;

    // Find the URL and increment its click count
    const url = await Url.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    // Handle unknown short codes
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    // Redirect to the original URL
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getUrlDetails(req, res) {
  try {
    const { shortCode } = req.params;

    // Find the URL using its short code
    const url = await Url.findOne({ shortCode });

    // Check whether the URL exists
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }

    // Return URL details
    return res.status(200).json({
      success: true,
      data: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks,
        createdAt: url.createdAt,
      },
    });
  } catch (error) {
    console.error("Get URL details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAllUrls(req, res) {
  try {
    const pageInput = req.query.page || "1";
    const limitInput = req.query.limit || "10";

    // Validate pagination parameters
    if (
      !/^\d+$/.test(pageInput) ||
      !/^\d+$/.test(limitInput) ||
      Number(pageInput) < 1 ||
      Number(limitInput) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
    }

    const page = Number(pageInput);
    const limit = Math.min(Number(limitInput), 100);

    // Check safe integer limits
    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit)
    ) {
      return res.status(400).json({
        success: false,
        message: "Page or limit is too large",
      });
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    if (!Number.isSafeInteger(skip)) {
      return res.status(400).json({
        success: false,
        message: "Requested page is too large",
      });
    }

    // Fetch URLs and total document count concurrently
    const [urls, totalUrls] = await Promise.all([
      Url.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Url.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        totalUrls,
        currentPage: page,
        totalPages: Math.ceil(totalUrls / limit),
        limit,
      },
      data: urls,
    });
  } catch (error) {
    console.error("Get all URLs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
