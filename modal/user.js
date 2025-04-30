const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    role: { type: String, default: "user", enum: ["user", "admin"] },
    profilePic: { type: String, default: "" },
    active:{type: Boolean, default: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("User", userSchema);
