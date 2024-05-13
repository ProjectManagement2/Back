import mongoose, { Schema } from "mongoose";

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    createdDate: {
        type: Date,
        default: Date.now
    },
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
    files: [{
        type: String,
    }],
    solution: {
        text: {
            type: String,
            default: ''
        },
        files: [{
            type: String,
        }],
        createdDate: {
            type: Date,
            default: Date.now
        },
    }
});

export default mongoose.model('Task', TaskSchema);
