const express = require("express");
const router = express.Router();
const User = require("../modal/user");
const { admin, verifyToken } = require("../utils/verify");
router.get("/users", verifyToken, admin, async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    console.log("Error:", error);
  }
})
module.exports = router