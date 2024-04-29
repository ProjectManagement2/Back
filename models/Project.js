import mongoose, { Schema } from "mongoose";

const ProjectSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    initiator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    projectLeaders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    stages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stage',
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    }]
});

export default mongoose.model("Project", ProjectSchema);
