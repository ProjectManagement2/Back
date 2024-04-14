import mongoose, { Schema } from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    }]
});

export default mongoose.model('Organization', OrganizationSchema);