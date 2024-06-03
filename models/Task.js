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
    startDate: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: "Новая"
    },
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
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
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
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
