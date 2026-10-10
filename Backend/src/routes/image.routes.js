const express = require("express")
const router = express.Router()
const uploadMiddleware = require("../middlewares/upload.middleware")
const uploadController = require("../controller/image.controller")
const optionalAuthMiddleware = require("../middlewares/optional-auth.middleware")
const authMiddleware = require("../middlewares/auth.middleware")

router.post("/upload", optionalAuthMiddleware.optionalAuth , uploadMiddleware.single("image"),uploadController.uploadImage)

router.get("/my-images", authMiddleware.authUser ,  uploadController.getMyImages)

router.post("/detect",authMiddleware.authUser, uploadMiddleware.single("image"),uploadController.detectImage
)

router.delete("/:id", authMiddleware.authUser, uploadController.deleteImage)



module.exports = router 

