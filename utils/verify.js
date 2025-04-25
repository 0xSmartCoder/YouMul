const jwt = require("jsonwebtoken");
require("dotenv").config();
async function verifyToken(req, res, next) {
  const authheader = req.headers.authorization;
  if (!authheader)
    return res.status(400).json({ message: "Access Denied! NoToken Found" });

  const token = authheader.split(" ")[1];
  if (!token)
    return res.status(400).json({ message: "Token format is invalid" });
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user_id = decode.id;
    next();
  } catch (Error) {
    res.status(401).json({ message: "Invalid Token!" });
    console.log("Error", Error);
  }
}

module.exports = verifyToken;
