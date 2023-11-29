import express from "express"
import { login, register, verify_otp,forgot_password } from "../controllers/auth.js"

const router=express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/verify-otp", verify_otp)
router.post("/forgot-password", forgot_password)

export default router