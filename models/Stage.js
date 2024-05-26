import mongoose, { Schema } from "mongoose";

const StageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isDone: {
        type: Boolean,
        required: true,
        default: false
    },
    isAvailable: {
        type: Boolean,
        required: true,
    },
    relatedStage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stage'
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
});

export default mongoose.model('Stage', StageSchema);
