const express = require("express")
// 1. Import all necessary middleware
const { authenticate, isTalent } = require("../middleware/auth")
const HireRequest = require("../models/HireRequest")
const Talent = require("../models/Talent")

const router = express.Router()

// 2. Protect all talent-facing hire request routes
router.use(authenticate, isTalent)

/**
 * @route   GET /api/hire-requests/
 * @desc    Get all hire requests for the logged-in talent
 * @access  Private (Talent only)
 */
router.get("/", async (req, res) => {
  try {
    // Find the talent profile for the logged-in user
    const talent = await Talent.findOne({ userId: req.user.id })
    if (!talent) {
      return res.status(404).json({ error: "Talent profile not found" })
    }

    // Find all hire requests where the talentId matches
    const hireRequests = await HireRequest.find({ talentId: talent._id })
      .populate("clientId", "companyName") // Populate client info
      .sort({ createdAt: -1 }) // Show newest first

    res.json({ hireRequests })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @route   GET /api/hire-requests/:requestId
 * @desc    Get a single hire request by ID
 * @access  Private (Talent only)
 */
router.get("/:requestId", async (req, res) => {
  try {
    const hireRequest = await HireRequest.findById(req.params.requestId)
      .populate("talentId")
      .populate("clientId")

    if (!hireRequest) {
      return res.status(404).json({ error: "Hire request not found" })
    }

    // 3. Security Check: Ensure the logged-in user is the talent
    //    associated with this hire request.
    if (hireRequest.talentId.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: Not your hire request" })
    }

    res.json({ hireRequest })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @route   PUT /api/hire-requests/:requestId
 * @desc    Update a hire request status (e.g., "Accepted", "Rejected")
 * @access  Private (Talent only)
 */
router.put("/:requestId", async (req, res) => {
  try {
    const { status, talentResponse } = req.body

    // 4. Validate that 'status' is a valid value
    const validStatuses = ["Accepted", "Rejected", "Pending"] // Or whatever your enum is
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" })
    }

    const hireRequest = await HireRequest.findById(req.params.requestId).populate("talentId")

    if (!hireRequest) {
      return res.status(404).json({ error: "Hire request not found" })
    }

    // 5. Security Check: Ensure the logged-in user is the talent
    if (hireRequest.talentId.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    hireRequest.status = status
    if (talentResponse) {
      hireRequest.talentResponse = talentResponse
    }

    await hireRequest.save()

    res.json({
      message: "Hire request updated",
      hireRequest,
    })
  } catch (error) {
    // Handle Mongoose validation errors (like a bad enum value)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

