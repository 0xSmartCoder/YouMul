const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {verifyToken} = require("../utils/verify");
const Post = require("../modal/post");
const multer = require("multer");

// Create a post
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
router.post("/post", verifyToken, upload.single("image"), async (req, res) => {
  console.log("Received Data: ", req.body);
  console.log("Received Image: ", req.file);
  const { text } = req.body;
  const file = req.file;

  if (!text)
    return res.status(400).json({ message: "Text Content Must Required!" });
  try {
    const newPost = new Post({
      text,
      image: file?.filename || null,
      userId: req.user_id,
    });
    await newPost.save();
    res.status(200).json({ message: "Post Created" });
  } catch (error) {
    res.status(401).json({ message: "Failed To Create Post" });
    console.log("Error:", error);
  }
});

// fetch myPosts
router.get("/myPost", verifyToken, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const posts = await Post.find({ userId: req.user_id })
      .populate("userId", "userName")
      .populate("comments.userId", "userName")
      .sort({ createdAt: -1 });
    if (!posts)
      return res.status(401).json({ message: "Failed to fetch posts" });
    res.status(200).json(posts);
  } catch (Error) {
    console.log("Error:", Error);
  }
});

// fetch users Posts

router.get("/user/:id", verifyToken, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const posts = await Post.find({ userId: req.params.id })
      .populate("userId", "userName")
      .populate("comments.userId", "userName")
      .sort({ createdAt: -1 });
    if (!posts)
      return res.status(401).json({ message: "Failed to fetch posts" });
    res.status(200).json(posts);
  } catch (Error) {
    console.log("Error:");
  }
});
// like on Post

router.put("/like/:id", verifyToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(401).json({ message: "Post not found" });

    if (post.likes.includes(user_id)) {
      post.likes.pull(user_id);
    } else {
      post.likes.push(user_id);
    }
    await post.save();
    res.status(200).json({ message: "Post like toggled", likes: post.likes });
  } catch (Error) {
    console.log("Error".error);
    res.status(200).json({ message: "Server Errror" });
  }
});

// GET single post by ID
router.get('/post/:id', verifyToken, async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post); 
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
});

// Comment on post
router.post("/comment/:id", verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user_id;
    const { text } = req.body;
    if (!text) return res.status(401).json({ message: "Text Required!" });
    console.log(text);
    const post = await Post.findById(postId);
    if (!post) return res.status(401).json({ message: "Post not found" });
    const newComment = {
      userId,
      text,
      createdAt: new Date(),
    };
    post.comments.push(newComment);
    console.log("comment is: ", post.comments);
    await post.save();
    return res
      .status(200)
      .json({ message: "Comment added", Comment: post.comments });
  } catch (Error) {
    console.log("Error", Error);
    return res.status(500).json({ message: "Server Errror" });
  }
});
module.exports = router;
