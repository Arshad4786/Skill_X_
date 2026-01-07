const mongoose = require("mongoose")

const talentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    headline: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: String,
      },
    ],
    experience: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior", "Lead", "Founder"],
      default: "Entry Level",
    },
    location: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: null,
    },
    resume: {
      type: String,
      default: null,
    },
    githubUrl: {
      type: String,
      default: "",
    },
    linkedinUrl: {
      type: String,
      default: "",
    },
    githubConnected: {
      type: Boolean,
      default: false,
    },
    githubAccessToken: {
      type: String,
      default: null,
      select: false,
    },
    // --- ADDED REFRESH TOKEN ---
    githubRefreshToken: {
      type: String,
      default: null,
      select: false,
    },
    linkedinConnected: {
      type: Boolean,
      default: false,
    },
    linkedinAccessToken: {
      type: String,
      default: null,
      select: false,
    },
    // --- ADDED REFRESH TOKEN ---
    linkedinRefreshToken: {
      type: String,
      default: null,
      select: false,
    },
    skillxScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
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
        ref: "Client",
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

// Calculate profile completion percentage
talentSchema.methods.getProfileCompletion = function () {
  const fields = [
    this.headline,
    this.bio,
    this.skills.length > 0,
    this.location,
    this.phoneNumber,
    this.profileImage,
    this.githubUrl || this.githubConnected,
    this.linkedinUrl || this.linkedinConnected,
  ]

  const completedFields = fields.filter((field) => field).length
  return Math.round((completedFields / fields.length) * 100)
}

module.exports = mongoose.model("Talent", talentSchema)

