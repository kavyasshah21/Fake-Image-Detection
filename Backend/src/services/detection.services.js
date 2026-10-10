// const { analyzeImage } = require("./ml.service")

// module.exports = {
//     analyzeImage
// }




const { analyzeImage: predictImage } = require("./ml.service");
const { generateReport } = require("./gemini.service");

async function analyzeImage(image) {
    // Step 1: Run the existing ViT prediction.
    const modelResult = await predictImage(image);

    // Step 2: Generate the Gemini report.
    let geminiReport = null;
    let reportStatus = "unavailable";

    try {
        geminiReport = await generateReport(modelResult);
        reportStatus = "generated";
    } catch (error) {
        console.error("Gemini Report Error:", error.message);
    }

    // Step 3: Preserve the original result and add the report.
    return {
        ...modelResult,
        geminiReport,
        reportStatus
    };
}

module.exports = { analyzeImage };
