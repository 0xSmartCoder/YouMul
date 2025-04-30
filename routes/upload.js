const express = require("express");
const router = express.Router();
const User = require("../modal/user");
const multer = require("multer");
const {verifyToken} = require("../utils/verify");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
router.post(
  "/profile-pic",
  verifyToken,
  upload.single("profilepic"),
  async (req, res) => {
    try {
      const userId = req.user_id;
      const filePath = `uploads/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(userId, {
        profilePic: filePath,
      });
      res
        .status(200)
        .json({ message: "Profile picture updated", profilePic: filePath });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  }
);
module.exports = router;
