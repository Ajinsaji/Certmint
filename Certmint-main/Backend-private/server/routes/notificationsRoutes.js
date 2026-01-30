const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");
const Notification = require("../config/models/Notification");

const router = express.Router();

// GET /api/notifications/unread-count
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const email = (req.user.email || "").toLowerCase().trim();
    if (!email) return res.json({ unread: 0 });

    const unread = await Notification.countDocuments({
      recipientEmail: email,
      isRead: false,
    });

    return res.json({ unread });
  } catch (err) {
    console.error("GET /notifications/unread-count error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/notifications?limit=50
router.get("/", authMiddleware, async (req, res) => {
  try {
    const email = (req.user.email || "").toLowerCase().trim();
    if (!email) return res.json({ notifications: [] });

    const limitRaw = parseInt(String(req.query.limit || "50"), 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

    const notifications = await Notification.find({ recipientEmail: email })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        certificateId: n.certificateId,
        isRead: n.isRead,
        createdAt: n.createdAt,
        readAt: n.readAt,
      })),
    });
  } catch (err) {
    console.error("GET /notifications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/notifications/mark-all-read
router.patch("/mark-all-read", authMiddleware, async (req, res) => {
  try {
    const email = (req.user.email || "").toLowerCase().trim();
    if (!email) return res.json({ updated: 0 });

    const result = await Notification.updateMany(
      { recipientEmail: email, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.json({ updated: result.modifiedCount || 0 });
  } catch (err) {
    console.error("PATCH /notifications/mark-all-read error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const email = (req.user.email || "").toLowerCase().trim();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipientEmail: email },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Notification not found" });

    return res.json({ message: "Marked read" });
  } catch (err) {
    console.error("PATCH /notifications/:id/read error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

