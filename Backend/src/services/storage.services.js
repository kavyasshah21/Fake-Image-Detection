const {ImageKit} = require("@imagekit/nodejs")

const imagekit = new ImageKit({
    privateKey : process.env.ImageKit_Private_Key
})

async function uploadFile(buffer , fileName){
    const result = await imagekit.files.upload({
        file : buffer.toString("base64"),
        fileName : fileName
    })
    return result;
}

async function deleteFile(fileId){

    const result = await imagekit.files.delete(fileId)

    return result
}

module.exports = {uploadFile , deleteFile}