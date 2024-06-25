import mongoose, { Schema } from 'mongoose'
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const adminSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
    },
    password: {
        type: String,
        required: true
    },
}, { timestamps: true })

adminSchema.pre("save", async function (next) {
    this.email = this.email.toLowerCase()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const Admin = mongoose.model('Admin', adminSchema)