const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // who should receive it (we use email because issuance uses studentEmailSnapshot)
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["CERTIFICATE_ISSUED"],
      default: "CERTIFICATE_ISSUED",
      index: true,
    },

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    // link back to the certificate
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      required: true,
      index: true,
    },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

