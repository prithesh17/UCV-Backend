import { Router } from "express";
import { registerAdmin, createStudent, createSubject, loginAdmin, listStudentsAndSubjects, removeStudent, removeSubject } from "../controllers/admin.controller.js";
import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";

const router = Router()

router.route('/register').post(registerAdmin)
router.route('/login').post(loginAdmin)
router.route('/createStudent').post(verifyAdminJWT,createStudent)
router.route('/createSubject').post(verifyAdminJWT, createSubject)
router.route('/dashboard').get(verifyAdminJWT, listStudentsAndSubjects)
router.route('/removeStudent').post(verifyAdminJWT, removeStudent)
router.route('/removeSubject').post(verifyAdminJWT, removeSubject)

export default router