import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {timestamps: true});

export default mongoose.model('Comment', CommentSchema);
