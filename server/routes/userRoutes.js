const express = require("express");
const { registerUser,userLogin} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware")
const User = require("../models/UserModel")
const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUser);
router.post("/login",userLogin);
// router.get("/login",getlogin);
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {

    console.log("✅ Request received at /dashboard");
    console.log("✅ Decoded user from token:", req.user);
    // ✅ Fetch user from the database using the ID from the token
    const user = await User.findById(req.user.userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Access granted!", user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user", error });
  }
});

module.exports = router;
