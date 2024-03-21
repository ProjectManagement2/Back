import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    role: {
        type: String,
        required: true
    }
});

export default mongoose.model('Permisson', PermissionSchema);