// This function is for update Mongo Schema

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./modal/user");
require("dotenv").config();
async function updatePassword() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    const Users = await User.find();
    for (let user of Users) {
      if (!user.password.startsWith("$2b$")){
      const passwordHash = await bcrypt.hash(user.password, 10)
      user.password = passwordHash
      await user.save();
      console.log(`Password updated for ${user.email}`);
    }}
    process.exit(0)
  } catch (error) {
    console.log("Error:", error);
  }
}
updatePassword();
