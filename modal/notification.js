const mongoose = require ("mongoose")

const notificationSchema = mongoose.Schema({
    toUserId:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    fromUserId:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    type: {type: String, enum: ["Like", "Follow", "Comment"], required: true},
    postId:{type: mongoose.Schema.Types.ObjectId, ref:"Post", default: null},
    createdAt:{type: Date, default: Date.now},
})

module.exports = mongoose.model("Notification", notificationSchema)