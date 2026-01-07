const express = require("express")

const jwt = require("jsonwebtoken")

const User = require("../models/User")

const Talent = require("../models/Talent")

const Client = require("../models/Client")

const Admin = require("../models/Admin")



const router = express.Router()



// Generate JWT Token

const generateToken = (id) => {

  return jwt.sign({ id }, process.env.JWT_SECRET, {

    expiresIn: process.env.JWT_EXPIRE || "7d",

  })

}



// Register (Talent)

router.post("/register/talent", async (req, res) => {

  try {

    const { email, password, name, githubUrl, linkedinUrl } = req.body



    // Check if user already exists

    const existingUser = await User.findOne({ email })

    if (existingUser) {

      return res.status(400).json({ error: "Email already registered" })

    }



    // Create user

    const user = new User({

      email,

      password,

      name,

      userType: "talent",

    })



    await user.save()



    // Create talent profile

    const talent = new Talent({

      userId: user._id,

      githubUrl,

      linkedinUrl,

    })



    await talent.save()



    // Generate token

    const token = generateToken(user._id)



    res.status(201).json({

      message: "Talent registered successfully",

      token,

      user: user.toJSON(),

      talentId: talent._id,

    })

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

})



// Register (Client)

router.post("/register/client", async (req, res) => {

  try {

    const { email, password, name, companyName, companyWebsite, industry } = req.body



    // Check if user already exists

    const existingUser = await User.findOne({ email })

    if (existingUser) {

      return res.status(400).json({ error: "Email already registered" })

    }



    // Create user

    const user = new User({

      email,

      password,

      name,

      userType: "client",

    })



    await user.save()



    // Create client profile

    const client = new Client({

      userId: user._id,

      companyName,

      companyWebsite,

      industry,

    })



    await client.save()



    // Generate token

    const token = generateToken(user._id)



    res.status(201).json({

      message: "Client registered successfully",

      token,

      user: user.toJSON(),

      clientId: client._id,

    })

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

})



// Login

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body



    if (!email || !password) {

      return res.status(400).json({ error: "Email and password required" })

    }



    // Find user

    const user = await User.findOne({ email }).select("+password")



    if (!user) {

      return res.status(401).json({ error: "Invalid email or password" })

    }



    // Check password

    const isPasswordValid = await user.matchPassword(password)



    if (!isPasswordValid) {

      return res.status(401).json({ error: "Invalid email or password" })

    }



    // Generate token

    const token = generateToken(user._id)



    res.json({

      message: "Login successful",

      token,

      user: user.toJSON(),

      userType: user.userType,

    })

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

})



// Get current user

router.get("/me", async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1]



    if (!token) {

      return res.status(401).json({ error: "No token provided" })

    }



    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)



    if (!user) {

      return res.status(404).json({ error: "User not found" })

    }



    res.json({

      user: user.toJSON(),

      userType: user.userType,

    })

  } catch (error) {

    res.status(401).json({ error: "Invalid token" })

  }

})



module.exports = router