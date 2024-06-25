import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { logoutUser } from './controllers/user.controller.js'
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import adminRouter from '../src/routes/admin.routes.js'
import studentRouter from '../src/routes/student.routes.js'
import subjectRouter from '../src/routes/subject.routes.js'

app.use("/admin", adminRouter)
app.use("/student", studentRouter)
app.use("/subject", subjectRouter)
app.use("/logout", logoutUser)
export { app }