const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    profilePic: { type: String, default: "" },
  },
  { timeStamps: true },
);
module.exports = mongoose.model("User", userSchema);
