const mongosse = require("mongoose");

const postSchema = mongosse.Schema({
  text: { type: String, required: true },
  userId: { type: mongosse.Schema.Types.ObjectId, required: true, ref: "User" },
  image: { type: String, default: "" },
  likes: [{ type: mongosse.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      userId: {
        type: mongosse.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongosse.model("Post", postSchema)
