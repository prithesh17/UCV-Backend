import mongoose, { Schema } from 'mongoose'

const attendanceSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    isPresent: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

export const Attendence = mongoose.model('Attendence', attendanceSchema)