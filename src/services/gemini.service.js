
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME =
    process.env.GEMINI_MODEL || "gemini-3-flash-preview";

/**
 * Generates a simple, user-friendly report from ML results.
 *
 * @param {Object} mlResult - Output returned by the ML service.
 * @returns {Promise<Object>} Gemini report containing seven sections.
 */
async function generateGeminiReport(mlResult) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from .env");
    }

    if (!mlResult || typeof mlResult !== "object") {
        throw new Error("Valid ML analysis results are required");
    }

    const {
        prediction,
        probabilities,
        attentionAnalysis,
        keyIndicators,
        visualPatterns,
        reasoning,
    } = mlResult;

    const reportData = {
        prediction: prediction ?? null,
        probabilities: probabilities ?? null,
        attentionAnalysis: attentionAnalysis ?? null,
        keyIndicators: keyIndicators ?? [],
        visualPatterns: visualPatterns ?? [],
        reasoning: reasoning ?? "",
    };

    const prompt = `
You are writing a report for a Fake Image Detection application.

Your task is to explain the supplied machine-learning results in
simple, clear language that an ordinary user can understand.

The user is NOT expected to have knowledge of machine learning,
artificial intelligence, image processing, or computer vision.

INPUT DATA:
${JSON.stringify(reportData, null, 2)}

WRITING STYLE:
1. Use simple, natural, professional English.
2. Explain the result as if you are explaining it to a general user.
3. Prefer short paragraphs and straightforward sentences.
4. Avoid unnecessary technical terminology, formulas, and jargon.
5. If a technical term is necessary, briefly explain what it means.
6. Do not repeat the same information in every section.
7. Explain what the supplied results indicate without exaggerating
   what they prove.
8. Do not invent observations about the image.
9. Do not claim that you personally inspected the image.
10. Do not introduce external facts that are absent from the input.

STRICT ACCURACY RULES:
1. Use only the supplied analysis results.
2. Preserve the predicted class exactly as supplied.
3. Preserve confidence values, probability values, attention
   measurements, indicator names, and indicator values exactly.
4. Do not recalculate, round, replace, or reinterpret numerical values.
5. Use the supplied keyIndicators values and labels. Do not create
   new indicators or change their Low, Medium, High, or other labels.
6. Explain attention as where the model focused while analyzing
   the image, not as proof that a particular area was manipulated.
7. A high model confidence is not a guarantee that the prediction
   is correct.
8. Do not claim that low attention proves an image is genuine.
9. Do not claim that attention measurements alone prove that an
   image is fake, genuine, manipulated, or AI-generated.
10. Distinguish the model's prediction from a verified fact.
11. If the input does not support a conclusion, state that limitation.
12. Do not invent image artifacts, editing traces, or causes for
    the model's prediction.
13. If a field is missing, explain the limitation rather than
    inventing a value.

REPORT SECTIONS:

1. executiveSummary
Write a brief, simple overview of the analysis. State the predicted
class and confidence exactly as supplied. Explain that this is an
automated model prediction, not a guarantee.

2. modelPredictionAndConfidence
Explain the predicted result and confidence in everyday language.
Do not describe confidence as the probability that the model is
certain to be correct.

3. classProbabilityAnalysis
Explain the supplied class probabilities in simple language.
Preserve the original class names and numerical values.
Do not confuse class probabilities with verified real-world truth.

4. numericalAttentionAnalysis
Explain the supplied attention measurements in plain English.
Describe what the measurements say about the model's focus.
Preserve all supplied numerical values exactly.
Do not invent thresholds or conclusions from the measurements.

5. keyIndicatorsAndVisualPatterns
Include the supplied key indicators and their values and labels.
Also explain the supplied visual patterns in simple language.
Keep the original indicator names, values, and labels unchanged.
Do not invent additional indicators or observations.

6. interpretationAndLimitations
Explain what can reasonably be understood from these results and
what cannot be established from them. Clearly state that the
automated prediction and attention analysis are not definitive
forensic proof of an image's origin or authenticity.

7. finalAssessment
Give a short, balanced conclusion based only on the supplied data.
State the predicted class and confidence when available.
Avoid absolute claims or unsupported conclusions.

OUTPUT REQUIREMENTS:
Return valid JSON only, with exactly these seven string fields:
{
  "executiveSummary": "...",
  "modelPredictionAndConfidence": "...",
  "classProbabilityAnalysis": "...",
  "numericalAttentionAnalysis": "...",
  "keyIndicatorsAndVisualPatterns": "...",
  "interpretationAndLimitations": "...",
  "finalAssessment": "..."
}

Do not return Markdown fences, introductory text, or extra fields.
Each field must contain a readable explanation, not another JSON object.
`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const responseText = response.text;

        if (!responseText) {
            throw new Error("Gemini returned an empty response");
        }

        const report = JSON.parse(responseText);

        const requiredFields = [
            "executiveSummary",
            "modelPredictionAndConfidence",
            "classProbabilityAnalysis",
            "numericalAttentionAnalysis",
            "keyIndicatorsAndVisualPatterns",
            "interpretationAndLimitations",
            "finalAssessment",
        ];

        for (const field of requiredFields) {
            if (
                typeof report[field] !== "string" ||
                report[field].trim() === ""
            ) {
                throw new Error(
                    `Gemini report is missing a valid "${field}" field`
                );
            }
        }

        // Return only the expected report fields.
        return Object.fromEntries(
            requiredFields.map((field) => [field, report[field]])
        );
    } catch (error) {
        console.error(
            "Gemini report generation failed:",
            error.message
        );

        throw new Error(
            `Failed to generate Gemini report: ${error.message}`
        );
    }
}

module.exports = {
    generateReport: generateGeminiReport,
};
