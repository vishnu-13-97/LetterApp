const mongoose = require("mongoose");

const draftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // ✅ Automatically adds createdAt & updatedAt
);

const Draft = mongoose.model("Draft", draftSchema);

module.exports = Draft;
