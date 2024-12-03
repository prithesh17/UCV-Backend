import mongoose, { Schema } from 'mongoose'

const fileSchema = new Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin',
    },
    fileName: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
    },
    url: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

fileSchema.index({ adminId: 1, fileName: 1 }, { unique: true }); 

export const File = mongoose.model('File', fileSchema);
