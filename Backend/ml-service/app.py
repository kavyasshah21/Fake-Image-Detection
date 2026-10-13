from flask import Flask, request, jsonify
from model import analyze_image

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    return "Fake Image Detection ML API is running"


@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({
            "success": False,
            "message": "Image not provided"
        }), 400

    image = request.files["image"]

    try:
        result = analyze_image(image.read())

        result["image"] = {
            "filename": image.filename
        }

        return jsonify(result)

    except Exception as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )