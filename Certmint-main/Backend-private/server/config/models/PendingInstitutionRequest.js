const mongoose = require("mongoose");

const pendingInstitutionRequestSchema = new mongoose.Schema(
  {
    institutionName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    documentPath: { type: String, trim: true, default: null },
    documentOriginalName: { type: String, trim: true, default: null },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PendingInstitutionRequest", pendingInstitutionRequestSchema);
