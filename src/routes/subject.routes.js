import { Router } from "express";
import { loginSubject, updateAttendence, studentList, updateMarks,getFacultyNameById } from "../controllers/subject.controller.js";
import { verifySubjectJWT } from "../middlewares/subjectAuth.middleware.js"
import { uploadPDF } from "../controllers/subject.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route('/login').post(loginSubject)
router.route('/studentList').get(verifySubjectJWT, studentList)
router.route('/updateAttendence').post(verifySubjectJWT, updateAttendence)
router.route('/updateMarks').post(verifySubjectJWT, updateMarks)
router.route('/uploadPDF').post(verifySubjectJWT, upload.single('file'), uploadPDF);
router.route('/chat').get(verifySubjectJWT, getFacultyNameById)

export default router