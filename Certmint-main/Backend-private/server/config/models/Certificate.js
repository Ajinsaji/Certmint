const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    // which student this cert belongs to
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },

    // which institution issued it
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // course / subject name
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // snapshot of student name at time of issuing
    studentNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },

    // optional snapshot of student email
    studentEmailSnapshot: {
      type: String,
      trim: true,
    },

    // snapshot of institution name at time of issuing
    institutionNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },

    // date of issue
    dateOfIssue: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // optional: a human-readable certificate code
    certificateCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    // blockchain NFT token ID (Ethereum)
    blockchainTokenId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
