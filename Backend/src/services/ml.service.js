const axios = require("axios")
const FormData = require("form-data")

async function analyzeImage(image) {

    const form = new FormData()

    form.append(
        "image",
        image.buffer,
        {
            filename: image.originalname,
            contentType: image.mimetype
        }
    )

    const response = await axios.post(
        process.env.ML_SERVICE_URL,
        form,
        {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 120000
        }
    )

    return response.data
}

module.exports = {
    analyzeImage
}