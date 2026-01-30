const express = require("express");
const router = express.Router();

const Certificate = require("../config/models/Certificate");
const Institution = require("../config/models/Institution");
const Student = require("../config/models/Student");
const authMiddleware = require("../middleware/auth");

/* ===============================
   GET certificates (institution)
================================ */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const institution = await Institution.findOne({ userId });
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const certificates = await Certificate.find({
      institution: institution._id,
    }).sort({ dateOfIssue: -1 }).lean();

    res.json({
      certificates: certificates.map(c => ({
        id: c._id,
        subject: c.subject,
        studentNameSnapshot: c.studentNameSnapshot,
        studentEmailSnapshot: c.studentEmailSnapshot,
        institutionNameSnapshot: c.institutionNameSnapshot,
        dateOfIssue: c.dateOfIssue,
        blockchainTokenId: c.blockchainTokenId,
      })),
    });
  } catch (err) {
    console.error("GET /certificates error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET certificates (student)
================================ */
router.get("/student", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const certificates = await Certificate.find({
      student: student._id,
    }).sort({ dateOfIssue: -1 }).lean();

    res.json({
      certificates: certificates.map(c => ({
        id: c._id,
        subject: c.subject,
        studentNameSnapshot: c.studentNameSnapshot,
        studentEmailSnapshot: c.studentEmailSnapshot,
        institutionNameSnapshot: c.institutionNameSnapshot,
        dateOfIssue: c.dateOfIssue,
        blockchainTokenId: c.blockchainTokenId,
      })),
    });
  } catch (err) {
    console.error("GET /certificates/student error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET single certificate
================================ */
router.get("/:id", async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).lean();

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({
      id: cert._id,
      subject: cert.subject,
      studentName: cert.studentNameSnapshot,
      institutionName: cert.institutionNameSnapshot,
      dateOfIssue: cert.dateOfIssue,
      institutionId: cert.institution,
      blockchainTokenId: cert.blockchainTokenId,
    });
  } catch (err) {
    console.error("Get certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
