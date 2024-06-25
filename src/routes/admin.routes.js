import { Router } from "express";
import { registerAdmin, createStudent, createSubject, loginAdmin } from "../controllers/admin.controller.js";
import { verifyAdminJWT } from "../middlewares/adminAuth.middleware.js";

const router = Router()

router.route('/register').post(registerAdmin)
router.route('/login').post(loginAdmin)
router.route('/createStudent').post(verifyAdminJWT,createStudent)
router.route('/createSubject').post(verifyAdminJWT, createSubject)

export default router