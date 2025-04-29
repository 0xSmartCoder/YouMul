const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../modal/user");
const verifyToken = require("../utils/verify");
const { default: mongoose } = require("mongoose");
const Notification = require("../modal/notification");
const router = express.Router();

router.get("/me", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token Not Found" });
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/search", verifyToken, async (req, res) => {
  const { user } = req.query;
  if (!user) return res.status(400).json({ message: "Type userName..." });
  const users = await User.find({
    userName: { $regex: user, $options: "i" },
  }).select("_id userName profilePic");
  res.json(users);
});

// follow
router.post("/follow/:id", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user_id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser)
      if (!targetUser)
        return res.status(400).json({ messsage: "Invalid User" });
    if (currentUser.following.includes(targetUser._id)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }
    currentUser.following.push(targetUser._id);
    await currentUser.save();
    targetUser.followers.push(currentUser._id);
    await targetUser.save();
    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// unfollow

router.post("/unfollow/:id", verifyToken, async (req, res) => {
  const currentUser = await User.findById(req.user_id);
  const targetUser = await User.findById(req.params.id);
  try {
    if (!targetUser) return res.status(400).json({ messsage: "Invalid User" });
    if (!currentUser.following.includes(targetUser._id)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    currentUser.following.pull(targetUser._id);
    await currentUser.save();
    targetUser.followers.pull(currentUser._id);
    await targetUser.save();

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/update", verifyToken, async (req, res) => {
  try {
    const { userName, bio } = req.body;
    const user_id = req.user_id;
    if (!userName || userName.length < 3) {
      return res
        .status(401)
        .json({ message: "UserName must be atleast 3 characters" });
    }
    const updateUser = await User.findByIdAndUpdate(
      user_id,
      { userName, bio },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "Profile updated",
      userName: updateUser.userName,
      bio: updateUser.bio,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server Errro!" });
  }
});

// GET profile by userId
router.get("/user/:userId", async (req, res) => {
  try {
    const profile = await User.findOne({ userId: req.params.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Profile fetch Error!:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/notification/:id", verifyToken, async (req, res) => {
  try {
    if(req.user_id !== req.params.id){
     return res.status(403).json({ message: "Not allowed to view others' notifications" });
    }
    console.log("Token user:", req.user_id)
console.log("Requested ID:", req.params.id)

    const notification = await Notification.find({ toUserId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("fromUserId", "userName profilePic");
    res.status(200).json(notification);
    console.log("Notifications found:", notification.length);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server errror" });
  }
});

module.exports = router;
