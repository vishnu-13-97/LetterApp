const passport = require("passport");
const jwt = require("jsonwebtoken");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/UserModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      scope: ["profile", "email"],
      accessType: "offline",
      prompt: "consent", 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value.toLowerCase();

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: displayName,
            email,
            google_id: id,
            google_access_token: accessToken,
            google_refresh_token: refreshToken || "",
          });
        } else if (!user.google_id) {
          user.google_id = id;


          user.google_access_token = accessToken;
          if (refreshToken) user.google_refresh_token = refreshToken;



          await user.save();
        }

        // ✅ Generate JWT Token (Fix: Use `user`, not `req.user`)
        const token = jwt.sign(
          { userId: user._id, name: user.name, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // ✅ Attach token to user object for session
        user.token = token;

        return done(null, user,token); // Only return the user (not an object with a token)
      } catch (error) {
        console.error("Error during Google OAuth login:", error);
        return done(error, null);
      }
    }
  )
);

// ✅ Serialize & Deserialize User (Fix)
passport.serializeUser((user, done) => {
  done(null, user._id); // Store only the user ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
