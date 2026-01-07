const express = require("express");
const axios = require("axios");
const { authenticate, isTalent } = require("../middleware/auth");
const Talent = require("../models/Talent");
const User = require("../models/User");
const HireRequest = require("../models/HireRequest");
// 1. Import the notification service
const { notifyAdminNewTalent } = require("../services/notifications.js"); // Corrected path

const router = express.Router();

// Get talent profile
router.get("/profile", authenticate, isTalent, async (req, res) => {
  try {
    const talent = await Talent.findOne({ userId: req.userId }).populate(
      "userId",
      "-password"
    );

    if (!talent) {
      return res.status(404).json({ error: "Talent profile not found" });
    }

    res.json({
      talent,
      profileCompletion: talent.getProfileCompletion(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update talent profile
router.put("/profile", authenticate, isTalent, async (req, res) => {
  try {
    const {
      headline,
      bio,
      skills,
      experience,
      location,
      phoneNumber,
      githubUrl,
      linkedinUrl,
    } = req.body;

    const talent = await Talent.findOneAndUpdate(
      { userId: req.userId },
      {
        headline,
        bio,
        skills,
        experience,
        location,
        phoneNumber,
        githubUrl,
        linkedinUrl,
      },
      { new: true }
    );

    if (!talent) {
      return res.status(404).json({ error: "Talent profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      talent,
      profileCompletion: talent.getProfileCompletion(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit profile for approval
router.post("/submit-for-review", authenticate, isTalent, async (req, res) => {
  try {
    const talent = await Talent.findOneAndUpdate(
      { userId: req.userId },
      { status: "pending" },
      { new: true }
    );

    if (!talent) {
      return res.status(404).json({ error: "Talent profile not found" });
    }

    // 2. --- THIS IS THE FIX ---
    // Send the WhatsApp notification to the admin
    try {
      // req.user is available from the 'authenticate' middleware
      await notifyAdminNewTalent(req.user.name, req.user.email);
    } catch (notificationError) {
      // Log the error, but don't stop the request.
      // The user's profile was still submitted successfully.
      console.error("WhatsApp notification failed:", notificationError.message);
    }
    // ------------------------

    res.json({
      message: "Profile submitted for review",
      talent,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate SkillX Score from GitHub
router.post("/calculate-skillx-score", authenticate, isTalent, async (req, res) => {
  try {
    // We must explicitly .select() the access token because it has select: false in the model
    const talent = await Talent.findOne({ userId: req.userId }).select(
      "+githubAccessToken"
    );

    if (!talent) {
      return res.status(404).json({ error: "Talent profile not found" });
    }

    if (!talent.githubConnected || !talent.githubAccessToken) {
      return res
        .status(400)
        .json({ error: "GitHub not connected or token is missing" });
    }

    // The GitHub API expects "token" not "Bearer" for OAuth tokens
    const headers = {
      Authorization: `token ${talent.githubAccessToken}`,
    };

    // Get user data
    const userResponse = await axios.get("https://api.github.com/user", {
      headers,
    });
    const githubUser = userResponse.data;

    // Get repositories
    const reposResponse = await axios.get(
      "https://api.github.com/user/repos?per_page=100",
      {
        headers,
      }
    );
    const repos = reposResponse.data;

    // Calculate metrics
    const publicRepos = githubUser.public_repos || 0;
    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

    // Get recent activity (commits in last year)
    let recentCommits = 0;
    for (const repo of repos.slice(0, 30)) {
      // Capping at 30 to avoid rate limits
      try {
        // Adding a delay to avoid secondary rate limits on stats endpoint
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const statsResponse = await axios.get(
          `https://api.github.com/repos/${repo.full_name}/stats/participation`,
          {
            headers,
          }
        );
        if (statsResponse.data && statsResponse.data.all) {
          recentCommits += statsResponse.data.all.reduce((a, b) => a + b, 0);
        }
      } catch (e) {
        console.warn(
          `Could not fetch stats for repo ${repo.full_name}: ${e.message}`
        );
        // Skip if stats not available (e.g., empty repo)
      }
    }

    // SkillX Score Algorithm
    const score =
      recentCommits * 0.05 +
      publicRepos * 1.5 +
      totalStars * 2 +
      totalForks * 1;
    // Simple log scaling to keep scores reasonable, capping at 100
    // Added a +1 to log10 to avoid log(0) which is -Infinity
    const skillxScore = Math.min(
      100,
      Math.round(10 * Math.log10(score + 1) * 3.3)
    );

    talent.skillxScore = skillxScore;
    await talent.save();

    res.json({
      message: "SkillX Score calculated successfully",
      skillxScore,
      metrics: {
        publicRepos,
        totalStars,
        totalForks,
        recentCommits,
      },
    });
  } catch (error) {
    console.error("GitHub API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to calculate SkillX Score",
      details: error.response?.data || error.message,
    });
  }
});

// Get hire requests for talent
router.get("/hire-requests", authenticate, isTalent, async (req, res) => {
  try {
    const talent = await Talent.findOne({ userId: req.userId });

    if (!talent) {
      // Removed 'D:'
      return res.status(404).json({ error: "Talent profile not found" });
    }

    const hireRequests = await HireRequest.find({ talentId: talent._id })
      .populate("clientId", "-password")
      .sort({ createdAt: -1 });

    res.json({ hireRequests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Respond to hire request
router.put(
  "/hire-requests/:requestId",
  authenticate,
  isTalent,
  async (req, res) => {
    // Removed 'S'
    try {
      const { status, response } = req.body;

      const hireRequest = await HireRequest.findByIdAndUpdate(
        req.params.requestId,
        {
          status,
          talentResponse: response,
        }, // Removed 'F'
        { new: true }
      ).populate("clientId", "-password");

      if (!hireRequest) {
        return res.status(404).json({ error: "Hire request not found" });
      }

      res.json({
        message: "Hire request updated successfully",
        hireRequest,
      });
    } catch (error) {
      // Corrected '5T' to '500'
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all approved talents (public endpoint for clients)
router.get("/all-approved", async (req, res) => {
  try {
    const { skills, search, sortBy } = req.query;

    const query = { status: "approved" };

    // Search by name or headline
    if (search) {
      query.$or = [
        { headline: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by skills
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      // Removed 'D'
      query.skills = { $in: skillArray };
    }

    let talentQuery = Talent.find(query).populate("userId", "name email");

    // Sort options
    if (sortBy === "score") {
      talentQuery = talentQuery.sort({ skillxScore: -1 });
    } else if (sortBy === "recent") {
      talentQuery = talentQuery.sort({ createdAt: -1 });
    } else {
      talentQuery = talentQuery.sort({ skillxScore: -1 });
    }

    const talents = await talentQuery.exec();

    res.json({ talents });
  } catch (error) {
    // Removed 'g'
    res.status(500).json({ error: error.message });
  }
});

// Get single talent profile (public)
router.get("/:talentId", async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.talentId)
      .populate("userId", "name email")
      .select(
        "-githubAccessToken -linkedinAccessToken -githubRefreshToken -linkedinRefreshToken"
      ); // Also hide refresh tokens

    if (!talent) {
      return res.status(404).json({ error: "Talent not found" });
    } // Removed '_'

    if (talent.status !== "approved") {
      return res
        .status(403)
        .json({ error: "This talent profile is not available" });
    }

    res.json({ talent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;