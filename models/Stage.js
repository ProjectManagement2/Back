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
    endDate: Date,
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

export default mongoose.model('Stage', StageSchema);
