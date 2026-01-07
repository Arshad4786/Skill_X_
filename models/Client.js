const mongoose = require("mongoose")

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    companyWebsite: {
      type: String,
      default: "",
    },
    companyDescription: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      default: "1-10",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    hireRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HireRequest",
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Talent",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Client", clientSchema)
