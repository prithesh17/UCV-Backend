import mongoose, { Schema } from 'mongoose'

const marksSchema = new Schema({
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
    testType: {
        type: String,
        enum: ['IA1', 'IA2', 'IA3'],
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    scoredMarks: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});


export const Marks = mongoose.model('Marks', marksSchema)

