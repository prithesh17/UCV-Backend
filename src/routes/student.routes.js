import { Router } from "express";
import { loginStudent, viewAttendence, viewMarks } from "../controllers/student.controller.js";
import { verifyStudentJWT } from "../middlewares/studentAuth.middleware.js"
const router = Router()

router.route('/login').post(loginStudent)
router.route('/attendence').get(verifyStudentJWT,viewAttendence)
router.route('/marks').get(verifyStudentJWT, viewMarks)
router.route('/subjectList').get(verifyStudentJWT, subjectList)

export default router