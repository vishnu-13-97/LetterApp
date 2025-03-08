const express = require("express");

const {saveDraft,getDrafts, deleteDraft,updateDraft} = require("../controllers/draftController");
const authMiddleware = require("../middlewares/authMiddleware")
const router = express.Router();

   
    router.post("/",authMiddleware,saveDraft);
    router.get("/:userId",authMiddleware,getDrafts);
    router.delete("/:id", authMiddleware,deleteDraft);
    router.put("/:id",authMiddleware,updateDraft)
    module.exports = router;