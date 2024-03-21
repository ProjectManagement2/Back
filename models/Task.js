import mongoose, { Schema } from "mongoose";

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    tags: Array,
    deadline: {
        type: Date,
        required: true
    },
    implementationStatus: String,
    updateDate: {
        type: Date,
        required: true
    },
    stage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stage'
    },
    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

export default mongoose.model('Task', TaskSchema);
