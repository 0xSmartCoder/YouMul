const express = require("express");
const router = express.Router();
const User = require("../modal/user");
const { admin, verifyToken } = require("../utils/verify");
router.get("/users", verifyToken, admin, async (req, res) => {
  try {
    const users = await User.find().select("userName email role _id active");
    return res.json(users);
  } catch (error) {
    console.log("Error:", error);
  }
})

router.put("/toggle-ban/:id", verifyToken, admin, async(req,res)=>{
try{
const user = await User.findById(req.params.id)
if(!user) return res.status(401).json({message:"user not found!"})
  user.active = !user.active
  await user.save()
  res.json({message:`User ${user.active ? "UnBanned" : "Ban"} successfully`, active:user.active})
}catch(error){
  console.log("Error:", error)
  return res.status(401).json({message:"Something went wrong!"})
}
})
module.exports = router