import mongoose, { Schema } from 'mongoose'
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const studentSchema = new Schema({
    adminId:{
        type: Schema.Types.ObjectId,
        ref:'Admin'
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    usn:{
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
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

studentSchema.pre("save", async function (next) {
    this.usn = this.usn.toUpperCase()
    this.email = this.email.toLowerCase()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


studentSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

studentSchema.methods.generateAccessToken = function(){
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


export const Student = mongoose.model('Student', studentSchema)