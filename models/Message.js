import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: true
    },
    stage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stage",
    }
});

export default mongoose.model('Message', MessageSchema);