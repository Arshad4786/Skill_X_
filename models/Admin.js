const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "moderator"],
      default: "moderator",
    },
    permissions: [
      {
        type: String,
        enum: ["approve_talent", "reject_talent", "view_hires", "send_notifications", "manage_admins"],
      },
    ],
    approvedCount: {
      type: Number,
      default: 0,
    },
    rejectedCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Admin", adminSchema)
