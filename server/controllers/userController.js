const User = require("../models/UserModel"); 
const bcrypt = require("bcrypt");
const {generateToken} = require ("../config/jwtConfig.js")
const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, google_id } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  // Convert email to lowercase for case-insensitive check
  const normalizedEmail = email.toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  let hashedPassword = null;

  // If registering with email/password (not Google OAuth)
  if (!google_id) {
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }

  try {
    // Create new user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword, // Can be null if registering via Google OAuth
      google_id: google_id || null, // Store Google ID if available
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });
    } else {
      return res.status(500).json({ message: "Failed to register user" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});


const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });

  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }


  

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});





module.exports = { registerUser , userLogin };
