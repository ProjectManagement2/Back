import mongoose, { Schema } from "mongoose";

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: "Новая"
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    tags: Array,
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    solutions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

export default mongoose.model('Task', TaskSchema);
