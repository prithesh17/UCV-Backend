import mongoose, { Schema } from 'mongoose'
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const subjectSchema = new Schema({
    adminId:{
        type: Schema.Types.ObjectId,
        ref:'Admin'
    },
    subjectName: {
        type: String,
        required: true,
        trim: true,
    },
    subjectCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    facultyName:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
}, { timestamps: true })

subjectSchema.pre("save", async function (next) {
    this.subjectCode = this.subjectCode.toUpperCase()
    this.email = this.email.toLowerCase()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


subjectSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

subjectSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            subjectcode: this.subjectCode,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const Subject = mongoose.model('Subject', subjectSchema)