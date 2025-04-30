const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config()
const http = require ('http')
const {Server} = require ("socket.io")
const path = require ("path")
const server = http.createServer(app)
const Notification = require ("./modal/notification")

const io = new Server(server,{
  cors:{
    origin: "*",
    method:["GET", "POST"]
  }
})
io.on('connection', (socket)=>{
  console.log("User Connected", socket.id)

  socket.on('join', (userId)=>{
    socket.join(userId)
  })
socket.on('sendNotification',async(data)=>{
  try{
    const {toUserId, fromUserId, type, postId} = data
    const alreadyExists = await Notification.findOne({
      toUserId,
      fromUserId,
      type,
      postId: postId || null,
    });

    if (alreadyExists) {
      console.log("Duplicate notification prevented");
      return;
    }
    const newNotification = new Notification({
      toUserId,
      fromUserId,
      type,
      postId: postId || null
    })
    console.log("Notification Data:", {
      toUserId, 
      fromUserId, 
      type, 
      postId
  })
    await newNotification.save()
    const populateNotification = await Notification.findById(newNotification._id).populate("fromUserId", "userName profilePic")
    io.to(toUserId).emit('getNotification',{
     _id: populateNotification._id,
     type: populateNotification.type,
     fromUser: populateNotification.fromUserId,
     postId: populateNotification.postId
    })
  }catch(Error){
    console.log("Error:", Error)
  }
})

socket.on('disconnect', ()=>{
  console.log("User Disconnected", socket.id)
})
})
app.use(express.json());
app.use(cors());
const upload = require ("./routes/upload")
const post = require("./routes/post");
const auth = require("./routes/auth");
const onlyAdmin = require ("./routes/onlyAdmin") 
const profile = require("./routes/profile");
const { Socket } = require("socket.io-client");
const { error } = require("console");
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
app.use("/api/onlyAdmin", onlyAdmin)
app.use('/image', express.static(path.join(__dirname, 'image')));
app.use(express.static('public'));
app.use("/api/upload", upload)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/api/auth", auth);
app.use("/api/post", post);
app.use("/api/profile", profile);
const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{
  console.log(`Server is connected: http://localhost:${PORT}`);
})

