const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Redirect user to Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"], 
    accessType: "offline", 
    prompt: "consent" 
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect("http://localhost:5173/login");
    }

    // ✅ Extract user data & generate JWT Token
    const user = req.user;
    console.log("user",user);
    
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Store JWT in HTTP-only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`http://localhost:5173/login?token=${token}`);
  }
);


// Logout Route - Clears Token
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
