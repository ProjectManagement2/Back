import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    stage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stage'
    },
    role: {
        type: String,
        required: true
    }
});

export default mongoose.model('Permisson', PermissionSchema);