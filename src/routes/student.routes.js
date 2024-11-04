import { Router } from "express";
import { loginStudent, viewAttendence, viewMarks, subjectList, viewPDFs, downloadPDF} from "../controllers/student.controller.js";
import { verifyStudentJWT } from "../middlewares/studentAuth.middleware.js"
const router = Router()

router.route('/login').post(loginStudent)
router.route('/attendence').post(verifyStudentJWT,viewAttendence)
router.route('/marks').post(verifyStudentJWT, viewMarks)
router.route('/subjectList').get(verifyStudentJWT, subjectList)
router.route('/getpdfs').get(verifyStudentJWT, viewPDFs)
router.route('/downloadPDF/:fileId').get(verifyStudentJWT, downloadPDF)

 
export default router