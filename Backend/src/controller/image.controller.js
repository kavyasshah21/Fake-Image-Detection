// const { analyzeImage } = require("../services/detection.services")
// const { uploadFile, deleteFile } = require("../services/storage.services")
// const imageModel = require("../models/image.model")



// async function uploadImage(req,res){

//     try{
//     const image = req.file

//     if(!image){
//         return res.status(400).json({
//             message : "Image Not Uploaded"
//         })
//     }

//     const result = await uploadFile(
//              image.buffer,
//              image.originalname
//     )

//     const userId = req.user?.id

//     const imageRecord = await imageModel.create({
//         imageUrl : result.url,
//         fileId : result.fileId,
//         fileName : image.originalname,
//         user : userId
//     })

//     return res.status(200).json({
//         message: "Image Uploaded Successfully",
//         image : imageRecord
//     })
// }
// catch(error){
//    return res.status(500).json({
//     message: "Something Went Wrong"
//    })
// }
// }

// async function getMyImages(req, res) {

//     try {

//         const { id } = req.user

//         const result = await imageModel.find({
//             user: id
//         })

//         return res.status(200).json({
//             images: result
//         })

//     } catch (error) {

//         return res.status(500).json({
//             message: "Something Went Wrong"
//         })
//     }
// }

// async function detectImage(req, res) {

//     try {

//         const image = req.file

//         if (!image) {
//             return res.status(400).json({
//                 message: "Image Not Uploaded"
//             })
//         }

//         const result = await analyzeImage(image)

//         return res.status(200).json({
//             message: "Image Analyzed Successfully",
//             result
//         })

//     } catch (error) {

//         console.log("ML Detection Error:", error.message)

//         return res.status(500).json({
//             message: "Something Went Wrong"
//         })
//     }
// }

// async function deleteImage(req,res){

//     try{

//         const { id : imageId } = req.params
//         const { id : userId } = req.user

//         const image = await imageModel.findOne({
//             _id : imageId,
//             user : userId
//         })

//         if(!image){
//             return res.status(404).json({
//                 message : "Image Not Found"
//             })
//         }

//         await deleteFile(image.fileId)

//         await imageModel.findOneAndDelete({
//             _id : imageId,
//             user : userId
//         })

//         return res.status(200).json({
//             message : "Image Deleted Successfully"
//         })

//     }
//     catch(error){

//         return res.status(500).json({
//             message : "Something Went Wrong"
//         })
//     }
// }

// module.exports = {uploadImage , getMyImages, detectImage, deleteImage}





const { analyzeImage } = require("../services/detection.services");
const { uploadFile, deleteFile } = require("../services/storage.services");
const imageModel = require("../models/image.model");

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

async function detectImage(req, res) {
    let uploadedFile = null;

    try {
        const image = req.file;

        if (!image) {
            return res.status(400).json({
                message: "Image Not Uploaded"
            });
        }

        // UPDATED: Run the existing ML and Gemini analysis.
        const result = await analyzeImage(image);

        // UPDATED: Upload the analyzed image to storage so that
        // its URL and file ID can be saved with the detection record.
        uploadedFile = await uploadFile(
            image.buffer,
            image.originalname
        );

        // UPDATED: Save the image details and complete analysis
        // result in MongoDB for the authenticated user.
        const userId = req.user?.id;

        const imageRecord = await imageModel.create({
            imageUrl: uploadedFile.url,
            fileId: uploadedFile.fileId,
            fileName: image.originalname,
            user: userId,

            // Stores the complete ML and Gemini response.
            detectionResult: result
        });

        // UPDATED: Return both the analysis and its saved record.
        return res.status(200).json({
            message: "Image Analyzed Successfully",
            result,
            imageRecord
        });

    } catch (error) {
        console.error("ML Detection / Save Error:", error.message);

        // UPDATED: Clean up the uploaded file if saving fails.
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

module.exports = {
    uploadImage,
    getMyImages,
    detectImage,
    deleteImage
};
