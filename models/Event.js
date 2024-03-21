import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    comment: String,
    file: {
        type: String,
    }
});

export default mongoose.model('Event', EventSchema);