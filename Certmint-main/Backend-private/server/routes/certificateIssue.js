const express = require("express");
const mongoose = require("mongoose");
const Certificate = require("../config/models/Certificate");
const Institution = require("../config/models/Institution");
const Student = require("../config/models/Student");
const User = require("../config/models/User"); // <- needed to find user by email
const authMiddleware = require("../middleware/auth"); // JWT parser
const Notification = require("../config/models/Notification");


const router = express.Router();
const mintCertificateNFT = require("../blockchain/mintCertificateNFT.cjs");


router.post("/", authMiddleware, async (req, res) => {
  try {
    const { subject, studentName, studentEmail, timePeriod, extraContent, certificateTemplate } = req.body;
    const userId = req.user.userId; // institution's userId

    // find institution
    const institution = await Institution.findOne({ userId });
    if (!institution) {
      return res.status(400).json({ message: "Institution profile not found" });
    }

    const validTemplates = ["classic"];
    const template = validTemplates.includes(certificateTemplate) ? certificateTemplate : "classic";

    // create the certificate directly (no student lookup)
    const cert = await Certificate.create({
      institution: institution._id,
      subject,
      studentNameSnapshot: studentName,
      studentEmailSnapshot: studentEmail,
      institutionNameSnapshot: institution.name,
      ...(timePeriod && { timePeriod: String(timePeriod).trim() }),
      ...(extraContent && { extraContent: String(extraContent).trim() }),
      certificateTemplate: template,
    });

    // 🔗 Mint NFT on blockchain
    const tokenId = await mintCertificateNFT({
      subject,
      studentName,
      studentEmail,
      certificateId: cert._id.toString(),
    });

    cert.blockchainTokenId = tokenId;
    await cert.save();

    // 🔔 Notify student (by email snapshot)
    if (studentEmail) {
      const recipientEmail = String(studentEmail).toLowerCase().trim();
      if (recipientEmail) {
        await Notification.create({
          recipientEmail,
          type: "CERTIFICATE_ISSUED",
          title: "New certificate issued",
          message: `${institution.name} issued you a certificate for "${subject}".`,
          certificateId: cert._id,
        });
      }
    }

    return res.status(201).json({
      message: "Certificate created successfully",
      certificate: cert,
    });

  } catch (err) {
    console.error("Create cert error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find institution for this user
    const institution = await Institution.findOne({ userId });
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const certificates = await Certificate.find({
      institution: institution._id,
    })
      .sort({ dateOfIssue: -1 })
      .lean();

    res.json({
      certificates: certificates.map(c => ({
        id: c._id,
        subject: c.subject,
        studentNameSnapshot: c.studentNameSnapshot,
        studentEmailSnapshot: c.studentEmailSnapshot,
        institutionNameSnapshot: c.institutionNameSnapshot,
        dateOfIssue: c.dateOfIssue,
        certificateCode: c.certificateCode,
        blockchainTokenId: c.blockchainTokenId,
      })),
    });
  } catch (err) {
    console.error("GET /certificates error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/student", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email; // 👈 from JWT

    if (!userEmail) {
      return res.status(400).json({ message: "Email not found in token" });
    }

    const certificates = await Certificate.find({
      studentEmailSnapshot: userEmail,
    })
      .sort({ dateOfIssue: -1 })
      .lean();

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
      timePeriod: cert.timePeriod || null,
      extraContent: cert.extraContent || null,
      certificateTemplate: cert.certificateTemplate || "classic",
    });
  } catch (err) {
    console.error("Get certificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
