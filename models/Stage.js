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
