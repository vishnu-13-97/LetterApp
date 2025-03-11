const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport")
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors")
const session = require("express-session");

const userRoutes= require("./routes/userRoutes")
const authRoutes = require("./routes/authRoutes")
const draftRoutes = require('./routes/draftRoutes')
const googleDriveRoutes = require("./routes/googleDriveRoutes")
require("./config/passport")
const app = express();
app.use(cookieParser());
app.use(cors({ origin: "http://letter-app-ten.vercel.app", credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const MONGO_URI = process.env.MONGO_URI;


app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drafts",draftRoutes);
app.use("/api/drive", googleDriveRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));





// app.get("/", (req, res) => {
//   res.send("Server is running...");
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
