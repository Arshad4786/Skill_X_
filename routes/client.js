const express = require("express")
const { authenticate, isClient } = require("../middleware/auth")
const Client = require("../models/Client")
const Talent = require("../models/Talent")
const HireRequest = require("../models/HireRequest")
const User = require("../models/User")
// 1. Import the notification service (with corrected filename)
const { notifyAdminNewHireRequest } = require("../services/notifications.js")

const router = express.Router()

// Get client profile
router.get("/profile", authenticate, isClient, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.userId }).populate("userId", "-password")

    if (!client) {
      return res.status(404).json({ error: "Client profile not found" })
    }

    res.json({ client })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update client profile
router.put("/profile", authenticate, isClient, async (req, res) => {
  try {
    const { companyName, companyWebsite, companyDescription, industry, companySize, contactPhone, location } = req.body

    const client = await Client.findOneAndUpdate(
      { userId: req.userId },
      {
        companyName,
        companyWebsite,
        companyDescription,
        industry,
        companySize,
        contactPhone,
        location,
      },
      { new: true },
    )

    if (!client) {
      return res.status(404).json({ error: "Client profile not found" })
    }

    res.json({
      message: "Profile updated successfully",
      client,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Search and browse approved talents (public endpoint)
router.get("/talents/search", async (req, res) => {
  try {
    const { search, skills, experience, location, sortBy, page = 1, limit = 10 } = req.query

    const query = { status: "approved" }

    // Text search
    if (search) {
      query.$or = [
        { headline: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Filter by skills
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills]
      query.skills = { $in: skillArray }
    }

    // Filter by experience
    if (experience) {
      query.experience = experience
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    // Sort options
    let sortOption = { skillxScore: -1 }
    if (sortBy === "recent") {
      sortOption = { createdAt: -1 }
    } else if (sortBy === "experience") {
      sortOption = { experience: 1 }
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const talents = await Talent.find(query)
      .populate("userId", "name email")
      .select("-githubAccessToken -linkedinAccessToken -githubRefreshToken -linkedinRefreshToken")
      .sort(sortOption)
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Talent.countDocuments(query)

    res.json({
      talents,
      pagination: {
        total,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single talent (public)
router.get("/talents/:talentId", async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.talentId)
      .populate("userId", "name email")
      .select("-githubAccessToken -linkedinAccessToken -githubRefreshToken -linkedinRefreshToken")

    if (!talent || talent.status !== "approved") {
      return res.status(404).json({ error: "Talent not found" })
    }

    res.json({ talent })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add talent to favorites
router.post("/favorites/:talentId", authenticate, isClient, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.userId })

    if (!client) {
      return res.status(404).json({ error: "Client profile not found" })
    }

    // Check if already in favorites
    if (!client.favorites.includes(req.params.talentId)) {
      client.favorites.push(req.params.talentId)
      await client.save()
    }

    res.json({ message: "Added to favorites" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Remove from favorites
router.delete("/favorites/:talentId", authenticate, isClient, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.userId })

    if (!client) {
      return res.status(404).json({ error: "Client profile not found" })
    }

    client.favorites = client.favorites.filter((id) => id.toString() !== req.params.talentId)
    await client.save()

    res.json({ message: "Removed from favorites" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get favorites
router.get("/favorites", authenticate, isClient, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.userId }).populate("favorites")

    if (!client) {
      return res.status(404).json({ error: "Client profile not found" })
    }

    res.json({ favorites: client.favorites })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Send hire request
router.post("/hire-requests", authenticate, isClient, async (req, res) => {
  try {
    const { talentId, jobTitle, jobDescription, employmentType, salary, location, skills } = req.body

    // Validate required fields
    if (!talentId || !jobTitle || !jobDescription || !employmentType) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const client = await Client.findOne({ userId: req.userId })

    if (!client) {
      return res.status(404).json({ error: "Client profile not found" })
    }

    // Check if talent exists and is approved
    // 2. Populate the talent's userId to get their name
    const talent = await Talent.findById(talentId).populate("userId", "name")

    if (!talent || talent.status !== "approved") {
      return res.status(404).json({ error: "Talent not found or not approved" })
    }

    // Create hire request
    const hireRequest = new HireRequest({
      clientId: client._id,
      talentId,
      jobTitle,
      jobDescription,
      employmentType,
      salary: salary || {},
      location: location || "",
      skills: skills || [],
    })

    await hireRequest.save()

    // Add to talent's hire requests
    talent.hireRequests.push(hireRequest._id)
    await talent.save()

    // Add to client's hire requests
    client.hireRequests.push(hireRequest._id)
    await client.save()

    // 3. --- THIS IS THE FIX ---
    // Send the WhatsApp notification to the admin
    try {
      // We get the talent's name from the populated userId
      await notifyAdminNewHireRequest(client.companyName, talent.userId.name)
    } catch (notificationError) {
      console.error("WhatsApp notification failed:", notificationError.message)
      // Do not block the main request if notification fails
    }
    // ------------------------

    res.status(201).json({
      message: "Hire request sent successfully",
      hireRequest,
    })
  } catch (error) {
    // 4. Handle validation errors (e.g., bad enum for employmentType)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message })
  }
})

// Get client's hire requests
router.get("/hire-requests", authenticate, isClient, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.userId })

    if (!client) {
      return res.status(404).json({ error: "Client profile not found" })
    }

    const hireRequests = await HireRequest.find({ clientId: client._id })
      .populate("talentId", "headline skillxScore")
      .populate("clientId", "companyName")
      .sort({ createdAt: -1 })

    res.json({ hireRequests })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single hire request
router.get("/hire-requests/:requestId", authenticate, isClient, async (req, res) => {
  try {
    const hireRequest = await HireRequest.findById(req.params.requestId).populate("talentId").populate("clientId")

    if (!hireRequest) {
      return res.status(404).json({ error: "Hire request not found" })
    }

    // Verify ownership
    const client = await Client.findOne({ userId: req.userId });
    if (hireRequest.clientId._id.toString() !== client._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    res.json({ hireRequest })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

