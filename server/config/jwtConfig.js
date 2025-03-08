const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ userId}, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null; // Invalid or expired token
  }
};

module.exports = { generateToken, verifyToken };
