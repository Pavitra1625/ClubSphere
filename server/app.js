
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5002",
  "https://clubsphere-jet.vercel.app",
  "https://clubsphere-r491klw3r-pavitra1625s-projects.vercel.app",
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Health-check route
app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    server: "running",
    database: connected ? "connected" : "disconnected",
    message: connected
      ? "ClubSphere API and database are working"
      : "API is running, but MongoDB is disconnected",
  });
});

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (err.message.startsWith("CORS blocked origin:")) {
    return res.status(403).json({
      message: "Origin not allowed by CORS.",
    });
  }

  res.status(500).json({
    message: "Unexpected server error.",
  });
});

module.exports = app;
