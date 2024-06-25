import { Router } from "express";
import { loginSubject, updateAttendence, studentList, updateMarks} from "../controllers/subject.controller.js";
import {verifySubjectJWT} from "../middlewares/subjectAuth.middleware.js"
import {logoutUser} from '../controllers/user.controller.js'

const router = Router()

router.route('/login').post(loginSubject)
router.route('/studentList').get(verifySubjectJWT, studentList)
router.route('/updateAttendence').post(verifySubjectJWT, updateAttendence)
router.route('/updateMarks').post(verifySubjectJWT, updateMarks)
export default router