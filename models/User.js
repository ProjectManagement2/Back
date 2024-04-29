import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    surname: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    otch: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    organizations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }]
}, {timestamps: true});

export default mongoose.model('User', UserSchema);