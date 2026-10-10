from model import analyze_image

image_path = "test_images/image.png"

with open(image_path, "rb") as file:
    image_bytes = file.read()

result = analyze_image(image_bytes)

print("\n" + "=" * 60)
print("        FAKE IMAGE DETECTION REPORT")
print("=" * 60)

print("\nPrediction")
print("-" * 60)
print("Class      :", result["prediction"]["class"])
print("Confidence :", result["prediction"]["confidence"], "%")

print("\nClass Probabilities")
print("-" * 60)
for name, value in result["probabilities"].items():
    print(f"{name}: {value}%")

print("\nAttention Analysis")
print("-" * 60)
for name, value in result["attentionAnalysis"].items():
    print(f"{name}: {value}")

print("\nKey Indicators")
print("-" * 60)
for item in result["keyIndicators"]:
    print(
        f"{item['name']}: "
        f"{item['value']} "
        f"(Score: {item['score']})"
    )

print("\nVisual Patterns")
print("-" * 60)
for pattern in result["visualPatterns"]:
    print("-", pattern)

print("\nDetailed Reasoning")
print("-" * 60)
print(result["reasoning"])

print("\nHeatmap")
print("-" * 60)
print("Original Image : Generated")
print("Heatmap        : Generated")
print("Overlay        : Generated")

print("\n" + "=" * 60)