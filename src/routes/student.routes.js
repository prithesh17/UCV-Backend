import { Router } from "express";
import { loginStudent, viewAttendence, viewMarks, subjectList, getPDFs, getLeaderboard, getUserNameById} from "../controllers/student.controller.js";
import { verifyStudentJWT } from "../middlewares/studentAuth.middleware.js"
const router = Router()

router.route('/login').post(loginStudent)
router.route('/attendence').post(verifyStudentJWT,viewAttendence)
router.route('/subjectList').get(verifyStudentJWT, subjectList)
router.route('/marks').get(verifyStudentJWT, viewMarks)
router.route('/getPDFs').get(verifyStudentJWT, getPDFs);
router.route('/leaderboard').get(verifyStudentJWT, getLeaderboard);
router.route('/chat').get(verifyStudentJWT, getUserNameById);


export default router