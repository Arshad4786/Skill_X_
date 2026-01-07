const express = require("express")
const { authenticate, isAdmin } = require("../middleware/auth")
const Talent = require("../models/Talent")
const Admin = require("../models/Admin")
const User = require("../models/User")
const HireRequest = require("../models/HireRequest")
// 1. Import the notification functions
const {
  notifyTalentApproved,
  notifyTalentRejected,
} = require("../services/notifications.js") // Make sure this path is correct

const router = express.Router()

// Get admin profile
router.get("/profile", authenticate, isAdmin, async (req, res) => {
  try {
    const admin = await Admin.findOne({ userId: req.userId }).populate("userId", "-password")

    if (!admin) {
      return res.status(404).json({ error: "Admin profile not found" })
    }

    res.json({ admin })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get dashboard statistics
router.get("/stats", authenticate, isAdmin, async (req, res) => {
  try {
    const pendingCount = await Talent.countDocuments({ status: "pending" })
    const approvedCount = await Talent.countDocuments({ status: "approved" })
    const rejectedCount = await Talent.countDocuments({ status: "rejected" })
    const totalHireRequests = await HireRequest.countDocuments()
    const pendingHireRequests = await HireRequest.countDocuments({ status: "pending" })

    const admin = await Admin.findOne({ userId: req.userId })

    res.json({
      stats: {
        pendingTalents: pendingCount,
        approvedTalents: approvedCount,
        rejectedTalents: rejectedCount,
        totalHireRequests,
        pendingHireRequests,
        adminApproved: admin?.approvedCount || 0,
        adminRejected: admin?.rejectedCount || 0,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all pending talent profiles
router.get("/pending-talents", authenticate, isAdmin, async (req, res) => {
  try {
    const { search } = req.query

    const query = { status: "pending" }

    // Search by name or email
    if (search) {
      // First find matching users
      const users = await User.find({
        $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      })

      const userIds = users.map((u) => u._id)
      query.$or = [{ userId: { $in: userIds } }, { headline: { $regex: search, $options: "i" } }]
    }

    const talents = await Talent.find(query)
      .populate("userId", "name email createdAt")
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({ talents })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single talent for review
router.get("/talent/:talentId", authenticate, isAdmin, async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.talentId)
      .populate("userId", "name email profileImage createdAt")
      .populate("hireRequests")

    if (!talent) {
      return res.status(404).json({ error: "Talent not found" })
    }

    res.json({
      talent,
      profileCompletion: talent.getProfileCompletion(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Approve talent
router.post("/approve-talent/:talentId", authenticate, isAdmin, async (req, res) => {
  try {
    const talent = await Talent.findByIdAndUpdate(req.params.talentId, { status: "approved" }, { new: true }).populate(
      "userId",
      "name email",
    )

    if (!talent) {
      return res.status(404).json({ error: "Talent not found" })
    }

    // Update admin stats
    await Admin.findOneAndUpdate({ userId: req.userId }, { $inc: { approvedCount: 1 } }, { upsert: true })

    // 2. --- THIS IS THE FIX ---
    // Send WhatsApp notification to talent
    try {
      await notifyTalentApproved(talent.phoneNumber, talent.userId.name)
    } catch (notificationError) {
      console.error("WhatsApp approval notification failed:", notificationError.message)
      // Do not block the main request if notification fails
    }
    // -------------------------

    res.json({
      message: "Talent approved successfully",
      talent,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Reject talent
router.post("/reject-talent/:talentId", authenticate, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" })
    }

    const talent = await Talent.findByIdAndUpdate(
      req.params.talentId,
      {
        status: "rejected",
        rejectionReason: reason,
      },
      { new: true },
    ).populate("userId", "name email")

    if (!talent) {
      return res.status(404).json({ error: "Talent not found" })
    }

    // Update admin stats
    await Admin.findOneAndUpdate({ userId: req.userId }, { $inc: { rejectedCount: 1 } }, { upsert: true })

    // 3. --- THIS IS THE FIX ---
    // Send WhatsApp notification to talent with rejection reason
    try {
      await notifyTalentRejected(talent.phoneNumber, talent.userId.name, reason)
    } catch (notificationError) {
      console.error("WhatsApp rejection notification failed:", notificationError.message)
      // Do not block the main request if notification fails
    }
    // -------------------------

    res.json({
      message: "Talent rejected successfully",
      talent,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all hire requests
router.get("/hire-requests", authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query

    const query = {}
    if (status) {
      query.status = status
    }

    const hireRequests = await HireRequest.find(query)
      // We populate the client, and then populate the user *inside* the client
      // to get the email address for the "Contact" button.
      .populate({
        path: "clientId",
        select: "companyName userId", // Select companyName and the userId reference
        populate: {
          path: "userId",
          select: "email" // Select the email from the User model
        }
      })
      .populate("talentId", "headline") // This is fine as-is
      .sort({ createdAt: -1 })

    res.json({ hireRequests })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single hire request
router.get("/hire-requests/:requestId", authenticate, isAdmin, async (req, res) => {
  try {
    const hireRequest = await HireRequest.findById(req.params.requestId)
      .populate({
        path: "clientId",
        select: "companyName companyWebsite userId",
        populate: {
          path: "userId",
          select: "name email"
        }
      })
      .populate({
        path: "talentId",
        select: "headline skills experience location",
        populate: {
          path: "userId",
          select: "name"
        }
      })

    if (!hireRequest) {
      return res.status(404).json({ error: "Hire request not found" })
    }

    res.json({ hireRequest })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all talents (with filters)
router.get("/talents", authenticate, isAdmin, async (req, res) => {
  try {
    const { status, search } = req.query

    const query = {}

    if (status) {
      query.status = status
    }

    if (search) {
      const users = await User.find({
        $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      })

      const userIds = users.map((u) => u._id)
      query.userId = { $in: userIds }
    }

    const talents = await Talent.find(query).populate("userId", "name email").sort({ createdAt: -1 })

    res.json({ talents })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

