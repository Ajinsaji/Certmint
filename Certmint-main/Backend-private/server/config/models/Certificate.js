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

    // optional: time period (e.g. "January 2024 - June 2024") – manual content
    timePeriod: {
      type: String,
      trim: true,
    },

    // optional: extra content line (e.g. duration, location) – manual content
    extraContent: {
      type: String,
      trim: true,
    },
    // blockchain NFT token ID (Ethereum)
    blockchainTokenId: {
      type: String,
    },

    // certificate design template used when issued
    certificateTemplate: {
      type: String,
      trim: true,
      enum: ["classic"],
      default: "classic",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
