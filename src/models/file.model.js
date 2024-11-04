import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin', 
    },
    fileName: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export const File = mongoose.model('File', fileSchema)
