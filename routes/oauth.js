// In routes/oauth.js
const express = require("express")
const passport = require("passport")
const jwt = require("jsonwebtoken")

const router = express.Router()

// Make sure your .env file has CLIENT_URL=http://localhost:3000
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:3000"

// === GitHub OAuth ===

// Path: GET /api/auth/oauth/github
// (This is the URL your "Connect GitHub" button should call)
router.get("/github", passport.authenticate("github", { scope: ["user:email", "read:user", "public_repo"] }))

// Path: GET /api/auth/oauth/github/callback
// (This is the URL you must put in your GitHub App's "Authorization callback URL" field)
router.get(
  "/github/callback",
  passport.authenticate("github", {
    // CORRECTED: This now redirects to your FRONTEND login page on failure
    failureRedirect: `${FRONTEND_URL}/talent/login`, 
    session: false, // We are using JWT, so no session is needed
  }),
  (req, res) => {
    // --- GitHub Auth Success ---
    // req.user is populated by your Passport strategy
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    })

    // Redirect back to your frontend. 
    // A dedicated /auth/callback page is a great pattern.
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&userType=${req.user.userType}`)
  }
)

// === LinkedIn OAuth ===

// Path: GET /api/auth/oauth/linkedin
router.get("/linkedin", passport.authenticate("linkedin", { scope: ["r_basicprofile", "r_emailaddress"] }))

// Path: GET /api/auth/oauth/linkedin/callback
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    // CORRECTED: This also redirects to your FRONTEND login page
    failureRedirect: `${FRONTEND_URL}/talent/login`, 
    session: false, // We are using JWT
  }),
  (req, res) => {
    // --- LinkedIn Auth Success ---
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    })

    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&userType=${req.user.userType}`)
  }
)

module.exports = router