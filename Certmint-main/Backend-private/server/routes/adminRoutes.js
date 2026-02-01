const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authMiddleware = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const User = require("../config/models/User");
const Student = require("../config/models/Student");
const Institution = require("../config/models/Institution");
const Certificate = require("../config/models/Certificate");
const PendingInstitutionRequest = require("../config/models/PendingInstitutionRequest");

const router = express.Router();

function toInt(value, fallback) {
  const n = parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function makeRegex(q) {
  if (!q) return null;
  return new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

// ----------------------------
// STATS (for admin dashboard overview)
// GET /api/admin/stats
// ----------------------------
router.get("/stats", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [usersCount, studentsCount, institutionsCount, certificatesCount, pendingCount] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Institution.countDocuments(),
      Certificate.countDocuments(),
      PendingInstitutionRequest.countDocuments({ status: "PENDING" }),
    ]);
    return res.json({
      users: usersCount,
      students: studentsCount,
      institutions: institutionsCount,
      certificates: certificatesCount,
      pendingRequests: pendingCount,
    });
  } catch (err) {
    console.error("GET /admin/stats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// USERS (filter by name/email/role)
// GET /api/admin/users?q=&role=&page=&limit=
// ----------------------------
router.get("/users", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const page = toInt(req.query.page, 1);
    const limit = Math.min(toInt(req.query.limit, 50), 200);
    const q = String(req.query.q || "").trim();
    const role = String(req.query.role || "").trim();

    const filter = {};
    const rx = makeRegex(q);
    if (rx) filter.$or = [{ name: rx }, { email: rx }];
    if (role) filter.role = role;

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      page,
      limit,
      total,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        banned: !!u.banned,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET /admin/users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role
// PATCH /api/admin/users/:id { role }
router.patch("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (!["STUDENT", "INSTITUTION", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "User updated",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, banned: user.banned },
    });
  } catch (err) {
    console.error("PATCH /admin/users/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Ban user - PATCH /api/admin/users/:id/ban
router.patch("/users/:id/ban", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN") {
      return res.status(400).json({ message: "Cannot ban an admin" });
    }
    await User.updateOne({ _id: id }, { banned: true });
    return res.json({
      message: "User banned",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, banned: true },
    });
  } catch (err) {
    console.error("PATCH /admin/users/:id/ban error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Unban user - PATCH /api/admin/users/:id/unban
router.patch("/users/:id/unban", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const user = await User.findByIdAndUpdate(id, { banned: false }, { new: true }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      message: "User unbanned",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, banned: false },
    });
  } catch (err) {
    console.error("PATCH /admin/users/:id/unban error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Safe delete user (prevents deleting institutions with issued certificates)
// DELETE /api/admin/users/:id
router.delete("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "INSTITUTION") {
      const inst = await Institution.findOne({ userId: user._id }).lean();
      if (inst) {
        const count = await Certificate.countDocuments({ institution: inst._id });
        if (count > 0) {
          return res.status(409).json({
            message:
              "Cannot delete this institution user because certificates were issued. Delete/transfer certificates first.",
          });
        }
        await Institution.deleteOne({ _id: inst._id });
      }
    } else if (user.role === "STUDENT") {
      await Student.deleteOne({ userId: user._id });
    }

    await User.deleteOne({ _id: user._id });

    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE /admin/users/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// PENDING INSTITUTION REQUESTS (signup requests)
// GET /api/admin/pending-institutions
// ----------------------------
router.get("/pending-institutions", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const list = await PendingInstitutionRequest.find({ status: "PENDING" })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({
      requests: list.map((r) => ({
        id: r._id,
        institutionName: r.institutionName,
        email: r.email,
        phone: r.phone || "",
        address: r.address || "",
        documentPath: r.documentPath || null,
        documentOriginalName: r.documentOriginalName || null,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET /admin/pending-institutions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/pending-institutions/:id/approve - create User + Institution, return temp password
router.post("/pending-institutions/:id/approve", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }
    const request = await PendingInstitutionRequest.findById(id).lean();
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "PENDING") {
      return res.status(400).json({ message: "Request already processed" });
    }
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }
    // Password is same as email for easy first login
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(request.email, salt);
    const user = await User.create({
      name: request.institutionName,
      email: request.email,
      passwordHash,
      role: "INSTITUTION",
    });
    await Institution.create({
      userId: user._id,
      name: request.institutionName,
      address: request.address || "",
      contactNumber: request.phone || "",
      locationUrl: "",
    });
    await PendingInstitutionRequest.updateOne(
      { _id: id },
      {
        status: "APPROVED",
        approvedBy: req.user.userId,
        approvedAt: new Date(),
        createdUserId: user._id,
      }
    );
    return res.json({
      message: "Institution approved. They can login with email and password same as email.",
      passwordSameAsEmail: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("POST /admin/pending-institutions/:id/approve error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Reject: optional - PATCH /api/admin/pending-institutions/:id/reject
router.patch("/pending-institutions/:id/reject", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }
    const request = await PendingInstitutionRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "PENDING") {
      return res.status(400).json({ message: "Request already processed" });
    }
    request.status = "REJECTED";
    request.approvedBy = req.user.userId;
    request.approvedAt = new Date();
    await request.save();
    return res.json({ message: "Request rejected" });
  } catch (err) {
    console.error("PATCH /admin/pending-institutions/:id/reject error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// INSTITUTIONS (filter by name/email)
// GET /api/admin/institutions?q=
// ----------------------------
router.get("/institutions", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const rx = makeRegex(q);

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    if (rx) {
      pipeline.push({
        $match: {
          $or: [{ name: rx }, { "user.name": rx }, { "user.email": rx }],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $limit: 500 }); // safety cap

    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        logoUrl: 1,
        address: 1,
        contactNumber: 1,
        locationUrl: 1,
        createdAt: 1,
        user: { _id: "$user._id", name: "$user.name", email: "$user.email", role: "$user.role" },
      },
    });

    const institutions = await Institution.aggregate(pipeline);

    return res.json({
      institutions: institutions.map((i) => ({
        id: i._id,
        name: i.name,
        logoUrl: i.logoUrl || null,
        address: i.address || "",
        contactNumber: i.contactNumber || "",
        locationUrl: i.locationUrl || "",
        createdAt: i.createdAt,
        user: i.user
          ? { id: i.user._id, name: i.user.name, email: i.user.email, role: i.user.role }
          : null,
      })),
    });
  } catch (err) {
    console.error("GET /admin/institutions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Institution drilldown: institution + issued certificates
// GET /api/admin/institutions/:id?certQ=
router.get("/institutions/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const certQ = String(req.query.certQ || "").trim();
    const rx = makeRegex(certQ);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid institution id" });
    }

    const institution = await Institution.findById(id)
      .populate({ path: "userId", model: "User", select: "name email role banned createdAt" })
      .lean();

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const certFilter = { institution: institution._id };
    if (rx) {
      certFilter.$or = [
        { subject: rx },
        { studentNameSnapshot: rx },
        { studentEmailSnapshot: rx },
        { institutionNameSnapshot: rx },
      ];
    }

    const certificates = await Certificate.find(certFilter)
      .sort({ dateOfIssue: -1 })
      .limit(1000)
      .lean();

    // Document from signup request (if institution was approved from a pending request)
    let documentPath = null;
    let documentOriginalName = null;
    if (institution.userId && institution.userId._id) {
      const approvedRequest = await PendingInstitutionRequest.findOne({
        createdUserId: institution.userId._id,
        status: "APPROVED",
      })
        .select("documentPath documentOriginalName")
        .lean();
      if (approvedRequest) {
        documentPath = approvedRequest.documentPath || null;
        documentOriginalName = approvedRequest.documentOriginalName || null;
      }
    }

    return res.json({
      institution: {
        id: institution._id,
        name: institution.name,
        logoUrl: institution.logoUrl || null,
        address: institution.address || "",
        contactNumber: institution.contactNumber || "",
        locationUrl: institution.locationUrl || "",
        createdAt: institution.createdAt,
        documentPath,
        documentOriginalName,
        user: institution.userId
          ? {
              id: institution.userId._id,
              name: institution.userId.name,
              email: institution.userId.email,
              role: institution.userId.role,
              banned: !!institution.userId.banned,
              createdAt: institution.userId.createdAt,
            }
          : null,
      },
      certificates: certificates.map((c) => ({
        id: c._id,
        subject: c.subject,
        studentName: c.studentNameSnapshot,
        studentEmail: c.studentEmailSnapshot || "",
        institutionName: c.institutionNameSnapshot,
        dateOfIssue: c.dateOfIssue,
        blockchainTokenId: c.blockchainTokenId,
      })),
    });
  } catch (err) {
    console.error("GET /admin/institutions/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// STUDENTS (filter by name/email)
// GET /api/admin/students?q=
// ----------------------------
router.get("/students", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const rx = makeRegex(q);

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];

    if (rx) {
      pipeline.push({
        $match: {
          $or: [{ "user.name": rx }, { "user.email": rx }],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $limit: 1000 }); // safety cap
    pipeline.push({
      $project: {
        _id: 1,
        createdAt: 1,
        user: { _id: "$user._id", name: "$user.name", email: "$user.email", role: "$user.role" },
      },
    });

    const students = await Student.aggregate(pipeline);

    return res.json({
      students: students.map((s) => ({
        id: s._id,
        createdAt: s.createdAt,
        user: s.user ? { id: s.user._id, name: s.user.name, email: s.user.email, role: s.user.role } : null,
      })),
    });
  } catch (err) {
    console.error("GET /admin/students error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// CERTIFICATES (filter by subject/student/institution/date)
// GET /api/admin/certificates?q=&institutionId=&from=&to=
// ----------------------------
router.get("/certificates", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const institutionId = String(req.query.institutionId || "").trim();
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();

    const rx = makeRegex(q);
    const filter = {};

    if (rx) {
      filter.$or = [
        { subject: rx },
        { studentNameSnapshot: rx },
        { studentEmailSnapshot: rx },
        { institutionNameSnapshot: rx },
      ];
    }

    if (institutionId) {
      if (!mongoose.Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({ message: "Invalid institutionId" });
      }
      filter.institution = new mongoose.Types.ObjectId(institutionId);
    }

    if (from || to) {
      filter.dateOfIssue = {};
      if (from) filter.dateOfIssue.$gte = new Date(from);
      if (to) filter.dateOfIssue.$lte = new Date(to);
    }

    const certs = await Certificate.find(filter)
      .sort({ dateOfIssue: -1 })
      .limit(2000)
      .populate({ path: "institution", model: "Institution", select: "name logoUrl" })
      .lean();

    return res.json({
      certificates: certs.map((c) => ({
        id: c._id,
        subject: c.subject,
        studentName: c.studentNameSnapshot,
        studentEmail: c.studentEmailSnapshot || "",
        institutionName: c.institutionNameSnapshot || c.institution?.name || "",
        institutionId: c.institution?._id || c.institution,
        institutionLogoUrl: c.institution?.logoUrl || null,
        dateOfIssue: c.dateOfIssue,
        certificateCode: c.certificateCode || null,
        blockchainTokenId: c.blockchainTokenId || null,
      })),
    });
  } catch (err) {
    console.error("GET /admin/certificates error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

