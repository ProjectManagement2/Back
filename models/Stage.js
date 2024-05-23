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
    // isAvailable: {
    //     type: Boolean,
    //     required: true
    // },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
});

export default mongoose.model('Stage', StageSchema);
