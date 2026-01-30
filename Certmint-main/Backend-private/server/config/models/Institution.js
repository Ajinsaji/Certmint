const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    locationUrl: {
      type: String,
      trim: true,
    },

    logoUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institution", institutionSchema);
