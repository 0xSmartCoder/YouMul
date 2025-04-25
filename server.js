const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config()
const path = require ("path")

app.use(express.json());
app.use(cors());
const upload = require ("./routes/upload")
const post = require("./routes/post");
const auth = require("./routes/auth");
const profile = require("./routes/profile");
app.get("/", (req, res) => {
  res.json("Api is running ✔️✔️");
});
mongoose.connect(
  process.env.MONGO_DB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log("Mongo DB Connected ✔️"))
    .catch((error) => {
      console.log("Error", error);
    })

app.use(express.static("style"));
app.use(express.static('public'));
app.use("/api/upload", upload)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/api/auth", auth);
app.use("/api/post", post);
app.use("/api/profile", profile);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is connected: http://localhost:${PORT}`);
});
