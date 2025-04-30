const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../modal/user");
async function verifyToken(req, res, next) {
  const authheader = req.headers.authorization;
  if (!authheader)
    return res.status(400).json({ message: "Access Denied! NoToken Found" });

  const token = authheader.split(" ")[1];
  if (!token)
    return res.status(400).json({ message: "Token format is invalid" });
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.id);
    req.user = user;
    req.user_id = user.id;
    next();
  } catch (Error) {
    res.status(401).json({ message: "Invalid Token!" });
    console.log("Error", Error);
  }
}
async function admin(req, res, next) {
  try {
    if (req.user.role != "admin") {
      return res.status(401).json({ message: "Only Admin!" });
    }
    next();
  } catch (error) {
    console.log("Error:", error);
  }
}

module.exports = { verifyToken, admin };
