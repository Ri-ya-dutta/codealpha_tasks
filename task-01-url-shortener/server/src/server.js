import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import urlRoutes from "./routes/urlRoutes.js";
import { redirectToOriginalUrl } from "./controllers/urlController.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());


app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "URL Shortener API is running",
  });
});

app.get("/:shortCode", redirectToOriginalUrl);
app.use("/api/urls", urlRoutes);

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();