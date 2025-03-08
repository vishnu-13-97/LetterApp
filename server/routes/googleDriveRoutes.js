const express = require("express");
const { saveLetterToDrive, listSavedLetters } = require("../services/googleDriveServices");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Route to Save Letter to Google Drive
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { content, fileName } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const response = await saveLetterToDrive(req.user.userId, content, fileName);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error saving letter:", error);
    res.status(500).json({ message: "Error saving letter", error: error.message });
  }
});

// ✅ Route to List Saved Letters
router.get("/list", authMiddleware, async (req, res) => {
  try {
    console.log("listfvgc",req.user);
    
    const files = await listSavedLetters(req.user.userId);

    console.log("Google Drive API is being called",files);

    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching letters:", error);
    res.status(500).json({ message: "Error fetching letters", error: error.message });
  }
});

module.exports = router;