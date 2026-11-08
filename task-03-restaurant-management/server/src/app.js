const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Restaurant Management API is running"
    });
});

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/tables", require("./routes/tableRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

module.exports = app;
