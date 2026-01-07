const jwt = require("jsonwebtoken")

const User = require("../models/User")



// Verify JWT token

const verifyToken = (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1]



  if (!token) {

    return res.status(401).json({ error: "No token provided" })

  }



  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.userId = decoded.id

    next()

  } catch (error) {

    return res.status(401).json({ error: "Invalid token" })

  }

}



// Check if user is authenticated

const authenticate = async (req, res, next) => {

  try {

    const token = req.headers.authorization?.split(" ")[1]



    if (!token) {

      return res.status(401).json({ error: "Authentication required" })

    }



    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)



    if (!user) {

      return res.status(401).json({ error: "User not found" })

    }



    req.user = user

    req.userId = user._id

    next()

  } catch (error) {

    return res.status(401).json({ error: "Authentication failed" })

  }

}



// Check if user is talent

const isTalent = (req, res, next) => {

  if (req.user.userType !== "talent") {

    return res.status(403).json({ error: "Only talents can access this" })

  }

  next()

}



// Check if user is client

const isClient = (req, res, next) => {

  if (req.user.userType !== "client") {

    return res.status(403).json({ error: "Only clients can access this" })

  }

  next()

}



// Check if user is admin

const isAdmin = (req, res, next) => {

  if (req.user.userType !== "admin") {

    return res.status(403).json({ error: "Only admins can access this" })

  }

  next()

}



module.exports = {

  verifyToken,

  authenticate,

  isTalent,

  isClient,

  isAdmin,

}