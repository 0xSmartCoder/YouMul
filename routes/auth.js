const express = require("express");
const router = express.Router();
const User = require("../modal/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;
  console.log(req.body);
  try {
    const existsUser = await User.findOne({ email });
    if (existsUser)
      return res.status(400).json({ message: "Email Already Exists" });
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hash,
    });
    await newUser.save();
    console.log(newUser);
    res.status(201).json({ message: "User Created" });
  } catch (error) {
    res.status(400).json({ message: "Failed to Created User" });
    console.log("Something Went Wrong", error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User Not Found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong Password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, userName: user.userName, email: user.email },
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to Login User" });
    console.log("Something Went Wrong", error);
  }
});

module.exports = router;
