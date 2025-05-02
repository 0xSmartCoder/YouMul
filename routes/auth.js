const express = require("express");
const router = express.Router();
const User = require("../modal/user");
const crypto = require("crypto")
const nodemailer = require("nodemailer")
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { verifyToken, admin } = require("../utils/verify");
const { runInContext } = require("vm");

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
      role: "user"
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

router.post("/forgot-password",async (req,res)=>{
  const {email} = req.body
  try{
  const user = await User.findOne({email})
  if(!user) return res.status(401).json({message:"User not found"})
    const token = crypto.randomBytes(20).toString("hex")
    user.resetToken = token,
    user.tokenExpiry = Date.now() + 3600000
    await user.save()

    // transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth:{
        user: "izaq719@gmail.com",
        pass: "ftugxtgsffpdcffj",
      },
      tls:{
        rejectUnauthorized: false
      }
    }) 

    const resetUrl = `http://localhost:5000/login.html?token=${token}`
    const mailOption = {
      to: user.email,
      from: "noreply@YouMul.com",
      subject: "Reset Password",
      html: `<p>Click <a href="${resetUrl}">here</a>to reset your password.</p>`
    }
    await transporter.sendMail(mailOption)
    res.json({ message: "Reset link sent to email." });

  }catch(error){
    console.log("Error:", error)
    res.status(500).json({ message: "Server error" });
  }
})

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const passwordHash = await bcrypt.hash(newPassword, 10)
    user.password = passwordHash
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password" });
  }
});

module.exports = router;
