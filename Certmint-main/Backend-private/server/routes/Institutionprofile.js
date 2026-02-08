const express = require("express");
const mongoose = require("mongoose");
const Certificate = require("../config/models/Certificate");
const Institution = require("../config/models/Institution");
const Student = require("../config/models/Student");
const User = require("../config/models/User");
const authMiddleware = require("../middleware/auth"); 
const uploadInstitutionLogo = require("../middleware/uploadInstitutionLogo");
const router = express.Router();



router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // from your existing middleware
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find institution for this logged-in user
    const institution = await Institution.findOne({ userId }).lean();
    if (!institution) {
      return res.status(404).json({ message: "Institution profile not found" });
    }

    const instId = institution._id;

    // Parse query params
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 1000);
    const includeMonthly = String(req.query.includeMonthly || "false").toLowerCase() === "true";

    // Recent certificates (latest first). Populate student->user if available.
    const certs = await Certificate.find({ institution: instId })
      .sort({ dateOfIssue: -1 })
      .limit(limit)
      .populate({
        path: "student",
        model: "Student",
        populate: { path: "userId", model: "User", select: "name email" }
      })
      .lean();

    const recentCertificates = certs.map(c => ({
      id: c._id,
      subject: c.subject,
      certificateCode: c.certificateCode || null,
      dateOfIssue: c.dateOfIssue,
      studentName: c.studentNameSnapshot || c.student?.userId?.name || null,
      studentEmail: c.studentEmailSnapshot || c.student?.userId?.email || null,
    }));

    // Basic stats
    const totalCertificates = await Certificate.countDocuments({ institution: instId });
    const distinctStudentIds = await Certificate.distinct("student", { institution: instId });
    const totalUniqueStudents = distinctStudentIds.filter(Boolean).length;

    // Subject breakdown (top subjects)
    const subjectAgg = await Certificate.aggregate([
      { $match: { institution: instId } },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    // Optional: monthly issuance for last 12 months
    let monthlyIssuance = [];
    if (includeMonthly) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1); // 12 months ago (start of month)
      const monthlyAgg = await Certificate.aggregate([
        { $match: { institution: instId, dateOfIssue: { $gte: start } } },
        { $group: { _id: { year: { $year: "$dateOfIssue" }, month: { $month: "$dateOfIssue" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
      const monthlyMap = {};
      monthlyAgg.forEach(m => {
        const key = `${m._id.year}-${String(m._id.month).padStart(2, "0")}`;
        monthlyMap[key] = m.count;
      });
      for (let i = 0; i < 12; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyIssuance.push({ period: key, count: monthlyMap[key] || 0 });
      }
    }

    // Student list (basic) - limited to first 200 unique student ids
    const studentIdsForQuery = distinctStudentIds.filter(Boolean).slice(0, 200);
    const students = await Student.find({ _id: { $in: studentIdsForQuery } })
      .populate({ path: "userId", model: "User", select: "name email" })
      .lean();

    const studentList = students.map(s => ({
      id: s._id,
      name: s.userId?.name || null,
      email: s.userId?.email || null
    }));

    // Response
    return res.json({
      institution: {
        id: institution._id,
        name: institution.name,
        address: institution.address,
        contactNumber: institution.contactNumber,
        locationUrl: institution.locationUrl,
        logoUrl: institution.logoUrl,
        certificateTemplate: institution.certificateTemplate || "classic",
      },
      stats: {
        totalCertificates,
        totalUniqueStudents,
      },
      recentCertificates,
      subjectBreakdown: subjectAgg.map(s => ({ subject: s._id, count: s.count })),
      monthlyIssuance,
      students: studentList,
    });
  } catch (err) {
    console.error("GET /dashboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const institution = await Institution.findOne({ userId });
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.json(institution);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Public: fetch institution basics by id (used by certificate view / verification)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid institution id" });
    }

    const institution = await Institution.findById(id)
      .select("name logoUrl address contactNumber locationUrl certificateTemplate")
      .lean();

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    return res.json({
      id: institution._id,
      name: institution.name,
      logoUrl: institution.logoUrl || null,
      address: institution.address || "",
      contactNumber: institution.contactNumber || "",
      locationUrl: institution.locationUrl || "",
      certificateTemplate: institution.certificateTemplate || "classic",
    });
  } catch (err) {
    console.error("GET /institution/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/create",
  authMiddleware,
  uploadInstitutionLogo.single("logo"),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { name, contactNumber, locationUrl, address, certificateTemplate } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ message: "Institution name is required" });
      }

      // 🔹 Convert address object/string → string
      let addressString = "";
      if (address) {
        const parsedAddress =
          typeof address === "string" ? JSON.parse(address) : address;

        const { line1, district, state, pincode } = parsedAddress;
        addressString = `${line1}, ${district}, ${state}${
          pincode ? " - " + pincode : ""
        }`;
      }

      // 🔹 Logo (DP) handling
      let logoUrl = null;
      if (req.file) {
        logoUrl = `/uploads/institutions/${req.file.filename}`;
      }

      const updateFields = {
        userId,
        name,
        contactNumber,
        locationUrl,
        address: addressString,
        ...(logoUrl && { logoUrl }),
      };
      if (certificateTemplate === "classic") {
        updateFields.certificateTemplate = certificateTemplate;
      }

      const institution = await Institution.findOneAndUpdate(
        { userId },
        updateFields,
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

      res.json({
        message: "Institution profile saved",
        institution,
      });
    } catch (err) {
      console.error("Institution create error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);





module.exports = router;
