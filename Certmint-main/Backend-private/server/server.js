// src/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateIssue');
const institutionRoutes = require("./routes/Institutionprofile");
const certificate = require("./routes/Certificates");
const adminRoutes = require("./routes/adminRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const seedDefaultAdmin = require("./config/seedAdmin");

const app = express();
const path = require("path");
const fs = require("fs");

// Enable CORS for frontend (React app)
app.use(cors({
  origin: 'http://localhost:3000',
}));

// Serve uploads: if file doesn't exist, return 404 without opening (avoids ENOENT when DB has stale logo path)
app.use("/uploads", (req, res, next) => {
  const uploadsDir = path.join(__dirname, "uploads");
  const filePath = path.resolve(uploadsDir, req.path.replace(/^\//, ""));
  if (!filePath.startsWith(uploadsDir)) {
    res.status(404).end();
    return;
  }
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).end();
      return;
    }
    next();
  });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Parse incoming JSON bodies
app.use(express.json());

// Basic API status check
app.get('/', (req, res) => {
  res.send('API is running ✅');
});

// Certificate-related routes
app.use("/api/certificates", certificateRoutes);

// Authentication routes (login, register, etc.)
app.use('/api/auth', authRoutes);

app.use("/api/institution", institutionRoutes);

// Institution dashboard / profile routes
app.use("/api/institutions", require("./routes/Institutionprofile"));

//dp upload
app.use("/uploads", express.static("uploads"));

app.use("/api/certificates", certificate);

// Admin routes
app.use("/api/admin", adminRoutes);

// Notifications (student)
app.use("/api/notifications", notificationsRoutes);


// Initialize MongoDB connection
connectDB()
  .then(async () => {
    try {
      await seedDefaultAdmin();
    } catch (e) {
      console.error("❌ Default admin seed failed:", e);
    }
  })
  .catch(() => {
    // connectDB already logs and exits, this is just a safety noop
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
