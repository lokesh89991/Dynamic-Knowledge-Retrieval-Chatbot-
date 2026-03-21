import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        default: 'default',
    },
    content: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Document = mongoose.model('Document', DocumentSchema);
export default Document;
