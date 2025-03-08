const expressAsyncHandler = require("express-async-handler");
const Draft = require("../models/LetterModel");



 const saveDraft = expressAsyncHandler(async (req, res) => {
    try {
      const { userId, content } = req.body;
  
      const newDraft = new Draft({
        userId,
        content,
      });
  
      await newDraft.save();
      res.status(201).json({ message: "Draft saved successfully", draft: newDraft });
    } catch (error) {
      console.error("Error saving draft:", error);
      res.status(500).json({ message: "Failed to save draft" });
    }
  })


 const getDrafts = expressAsyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const drafts = await Draft.find({ userId }).sort({ createdAt: -1 });
  
    

    if (!drafts.length) {
      return res.status(404).json({ message: "No drafts found" });
    }

    res.status(200).json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ message: "Failed to fetch drafts" });
  }
});


const deleteDraft = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params; // Get draft ID from URL params

    const deletedDraft = await Draft.findByIdAndDelete(id);

    if (!deletedDraft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    res.status(200).json({ message: "Draft deleted successfully", deletedDraft });
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({ message: "Failed to delete draft" });
  }
});


const updateDraft = expressAsyncHandler(async(req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const updatedDraft = await Draft.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    res.json(updatedDraft);
  } catch (error) {
    res.status(500).json({ message: "Failed to update draft", error });
  }})
  

  module.exports={
    saveDraft,
    getDrafts,
    deleteDraft,
    updateDraft
  }