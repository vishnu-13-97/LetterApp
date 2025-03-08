const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("🚀 Middleware running...");

  let token = req.header("Authorization");
  console.log("🔍 Received Token:", token); // Debugging token

  if (!token || !token.startsWith("Bearer ")) {
    console.log("❌ No token found or incorrect format");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    token = token.split(" ")[1]; // Extract actual token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    console.log("✅ Decoded user from token:", decoded); // Log decoded user

    next();
  } catch (error) {
    console.log("❌ Invalid Token:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
