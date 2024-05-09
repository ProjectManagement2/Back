import mongoose from "mongoose";

const SolutionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    // file: {
    //     type: String,
    // },
    createdDate: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model('Solution', SolutionSchema);