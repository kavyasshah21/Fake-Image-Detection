const express = require("express")
const router = express.Router()
const authController = require("../controller/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")


router.post("/signup",authController.Signup)
router.post("/login",authController.Login)

router.get("/profile", authMiddleware.authUser , authController.Profile)

router.post("/logout", authController.LogOut)




module.exports = router