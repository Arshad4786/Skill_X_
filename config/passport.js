const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const User = require("../models/User");
const Talent = require("../models/Talent");

// --- Prerequisite: Your .env file MUST have these ---
// GITHUB_CLIENT_ID=...
// GITHUB_CLIENT_SECRET=...
// GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/oauth/github/callback
//
// LINKEDIN_CLIENT_ID=...
// LINKEDIN_CLIENT_SECRET=...
// LINKEDIN_CALLBACK_URL=http://localhost:5000/api/auth/oauth/linkedin/callback
// ---------------------------------------------------

// === 1. LocalStrategy (Email/Password) ===
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// === 2. GitHub Strategy (For Sign Up & Log In) ===
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user:email", "read:user", "public_repo"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;

        if (!email) {
          return done(
            new Error(
              "No public email on GitHub. Please add one or use email/password."
            ),
            null
          );
        }

        // 1. Find by GitHub ID
        let user = await User.findOne({ githubId: profile.id });
        if (user) {
          // User exists, update their tokens
          const talent = await Talent.findOne({ userId: user._id });
          if (talent) {
            talent.githubAccessToken = accessToken;
            talent.githubRefreshToken = refreshToken; // <-- SAVE REFRESH TOKEN
            talent.githubConnected = true;
            await talent.save();
          }
          return done(null, user);
        }

        // 2. Find by Email (user exists, but hasn't linked GitHub)
        user = await User.findOne({ email: email });
        if (user) {
          user.githubId = profile.id;
          await user.save();

          // Also link their talent profile
          const talent = await Talent.findOne({ userId: user._id });
          if (talent) {
            talent.githubUrl = talent.githubUrl || profile.profileUrl;
            talent.githubAccessToken = accessToken;
            talent.githubRefreshToken = refreshToken; // <-- SAVE REFRESH TOKEN
            talent.githubConnected = true;
            await talent.save();
          }
          return done(null, user);
        }

        // 3. Create new user (this is a brand new sign-up)
        const newUser = new User({
          githubId: profile.id,
          name: profile.displayName || profile.username,
          email: email,
          userType: "talent",
          password: Math.random().toString(36).slice(-8),
        });
        await newUser.save();

        // Create the associated (but incomplete) Talent profile
        const newTalent = new Talent({
          userId: newUser._id,
          name: newUser.name,
          email: newUser.email,
          githubUrl: profile.profileUrl,
          githubAccessToken: accessToken,
          githubRefreshToken: refreshToken, // <-- SAVE REFRESH TOKEN
          githubConnected: true,
        });
        await newTalent.save();

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// === 3. LinkedIn Strategy (For Sign Up & Log In) ===
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ["r_liteprofile", "r_emailaddress"],
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;

        if (!email) {
          return done(
            new Error(
              "No public email on LinkedIn. Please add one or use email/password."
            ),
            null
          );
        }

        // 1. Find by LinkedIn ID
        let user = await User.findOne({ linkedinId: profile.id });
        if (user) {
          // User exists, update their tokens
          const talent = await Talent.findOne({ userId: user._id });
          if (talent) {
            talent.linkedinAccessToken = accessToken;
            talent.linkedinRefreshToken = refreshToken; // <-- SAVE REFRESH TOKEN
            talent.linkedinConnected = true;
            await talent.save();
          }
          return done(null, user);
        }

        // 2. Find by Email (user exists, but hasn't linked LinkedIn)
        user = await User.findOne({ email: email });

        if (user) {
          user.linkedinId = profile.id;
          await user.save();

          // Also link their talent profile
          const talent = await Talent.findOne({ userId: user._id });
          if (talent) {
            talent.linkedinUrl = talent.linkedinUrl || profile.profileUrl;
            talent.linkedinAccessToken = accessToken;
            talent.linkedinRefreshToken = refreshToken; // <-- SAVE REFRESH TOKEN
            talent.linkedinConnected = true;
            await talent.save();
          }

          return done(null, user);
        }

        // 3. Create new user
        const newUser = new User({
          linkedinId: profile.id,
          name: profile.displayName,
          email: email,
          userType: "talent",
          password: Math.random().toString(36).slice(-8),
        });
        await newUser.save();

        // Create the associated (but incomplete) Talent profile
        const newTalent = new Talent({
          userId: newUser._id,
          name: newUser.name,
          email: newUser.email,
          linkedinUrl: profile.profileUrl,
          linkedinAccessToken: accessToken,
          linkedinRefreshToken: refreshToken, // <-- SAVE REFRESH TOKEN
          linkedinConnected: true,
        });
        await newTalent.save();

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// === 4. Session Management (This code is correct) ===
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;