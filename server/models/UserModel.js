const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    google_id: {
      type: String,
      unique:true,
      sparse: true, // Allows null values while keeping uniqueness constraint
    },
    name: {
        type: String,
        required: true,
        trim: true,
      },

    google_access_token: { type:String},
  
  google_refresh_token: { type:String},
  

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.google_id; // Password is required only if google_id is not present
      },
      minlength: 6,
    },
 
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
