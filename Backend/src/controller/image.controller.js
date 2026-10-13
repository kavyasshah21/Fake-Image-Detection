const { analyzeImage } = require("../services/detection.services");
const { uploadFile, deleteFile } = require("../services/storage.services");
const imageModel = require("../models/image.model");
const mongoose = require("mongoose");

// Upload an image and save its record.
async function uploadImage(req, res) {
    try {
        const image = req.file;

        if (!image) {
            return res.status(400).json({
                message: "Image Not Uploaded"
            });
        }

        const result = await uploadFile(
            image.buffer,
            image.originalname
        );

        const userId = req.user?.id;

        const imageRecord = await imageModel.create({
            imageUrl: result.url,
            fileId: result.fileId,
            fileName: image.originalname,
            user: userId
        });

        return res.status(200).json({
            message: "Image Uploaded Successfully",
            image: imageRecord
        });

    } catch (error) {
        console.error("Image Upload Error:", error.message);

        return res.status(500).json({
            message: "Something Went Wrong"
        });
    }
}


// Get all images uploaded by the logged-in user.
async function getMyImages(req, res) {
    try {
        const { id } = req.user;

        const result = await imageModel.find({
            user: id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            images: result
        });

    } catch (error) {
        console.error("Get Images Error:", error.message);

        return res.status(500).json({
            message: "Something Went Wrong"
        });
    }
}


// Get a particular image using its ID.
async function getImageById(req, res) {
    try {
        const { id: imageId } = req.params;
        const { id: userId } = req.user;

        // Validate the MongoDB image ID.
     const mongoose = require("mongoose");

if (!mongoose.Types.ObjectId.isValid(imageId)) {
    return res.status(400).json({
        message: "Invalid Image ID"
    });
}

        const image = await imageModel.findOne({
            _id: imageId,
            user: userId
        });

        if (!image) {
            return res.status(404).json({
                message: "Image Not Found"
            });
        }

        return res.status(200).json({
            image
        });

    } catch (error) {
        console.error("Get Image By ID Error:", error.message);

        if (
            error.name === "CastError" ||
            error.name === "BSONError" ||
            error.name === "ObjectId"
        ) {
            return res.status(400).json({
                message: "Invalid Image ID"
            });
        }

        return res.status(500).json({
            message: "Something Went Wrong"
        });
    }
}


// Analyze an image, upload it to storage, and save its result.
async function detectImage(req, res) {
    let uploadedFile = null;

    try {
        const image = req.file;

        if (!image) {
            return res.status(400).json({
                message: "Image Not Uploaded"
            });
        }

        // Run the existing ML and Gemini analysis.
        const result = await analyzeImage(image);

        // Upload the analyzed image to storage.
        uploadedFile = await uploadFile(
            image.buffer,
            image.originalname
        );

        const userId = req.user?.id;

        // Save the image and detection result in MongoDB.
        const imageRecord = await imageModel.create({
            imageUrl: uploadedFile.url,
            fileId: uploadedFile.fileId,
            fileName: image.originalname,
            user: userId,
            detectionResult: result
        });

        return res.status(200).json({
            message: "Image Analyzed Successfully",
            result,
            imageRecord
        });

    } catch (error) {
        console.error(
            "ML Detection / Save Error:",
            error.message
        );

        // Clean up the uploaded file if saving fails.
        if (uploadedFile?.fileId) {
            try {
                await deleteFile(uploadedFile.fileId);
            } catch (cleanupError) {
                console.error(
                    "Uploaded File Cleanup Error:",
                    cleanupError.message
                );
            }
        }

        return res.status(500).json({
            message: "Something Went Wrong"
        });
    }
}


// Delete an image belonging to the logged-in user.
async function deleteImage(req, res) {
    try {
        const { id: imageId } = req.params;
        const { id: userId } = req.user;

        const image = await imageModel.findOne({
            _id: imageId,
            user: userId
        });

        if (!image) {
            return res.status(404).json({
                message: "Image Not Found"
            });
        }

        await deleteFile(image.fileId);

        await imageModel.findOneAndDelete({
            _id: imageId,
            user: userId
        });

        return res.status(200).json({
            message: "Image Deleted Successfully"
        });

    } catch (error) {
        console.error("Delete Image Error:", error.message);

        return res.status(500).json({
            message: "Something Went Wrong"
        });
    }
}


// Export all controller functions.
module.exports = {
    uploadImage,
    getMyImages,
    getImageById,
    detectImage,
    deleteImage
};
