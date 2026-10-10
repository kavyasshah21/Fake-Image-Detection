import os, io, base64, cv2 # type: ignore
import numpy as np # type: ignore
import torch# type: ignore
import torch.nn as nn # type: ignore
import torch.nn.functional as F # type: ignore

from PIL import Image # type: ignore
from torchvision import transforms # type: ignore
from torchvision.models import vit_b_16 # pyright: ignore[reportMissingImports]


# Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

path = os.path.join(
    os.path.dirname(__file__),
    "models",
    "best_vit_model.pth"
)

checkpoint = torch.load(
    path,
    map_location=device,
    weights_only=False
)

class_to_idx = checkpoint["class_to_idx"]
idx_to_class = {v: k for k, v in class_to_idx.items()}

model = vit_b_16(weights=None)
model.heads.head = nn.Linear(
    model.heads.head.in_features,
    len(class_to_idx)
)

model.load_state_dict(checkpoint["model_state_dict"])
model.to(device).eval()


# Base64
def encode(img):
    _, buffer = cv2.imencode(".png", img)
    return "data:image/png;base64," + base64.b64encode(buffer).decode()


# Attention
def get_attention(x):
    with torch.no_grad():
        x = model._process_input(x)
        n = x.shape[0]

        cls = model.class_token.expand(n, -1, -1)
        x = torch.cat([cls, x], 1)
        x = x + model.encoder.pos_embedding

        attention = None

        for layer in model.encoder.layers:
            y = layer.ln_1(x)
            a = layer.self_attention

            qkv = F.linear(
                y,
                a.in_proj_weight,
                a.in_proj_bias
            )

            q, k, _ = qkv.chunk(3, dim=-1)

            q = q.reshape(
                n, -1, a.num_heads, a.head_dim
            ).permute(0, 2, 1, 3)

            k = k.reshape(
                n, -1, a.num_heads, a.head_dim
            ).permute(0, 2, 1, 3)

            attention = torch.softmax(
                q @ k.transpose(-2, -1)
                / np.sqrt(a.head_dim),
                dim=-1
            )

            x = layer(x)

    return attention[:, :, 0, 1:].mean(1).reshape(14, 14).cpu().numpy()


# Analysis
def analyze_attention(a):
    a = cv2.resize(a, (224, 224))
    a = cv2.normalize(a, None, 0, 1, cv2.NORM_MINMAX)

    regions = [
        "top-left", "top-center", "top-right",
        "middle-left", "center", "middle-right",
        "bottom-left", "bottom-center", "bottom-right"
    ]

    scores = [
        np.mean(a[i*74:(i+1)*74, j*74:(j+1)*74])
        for i in range(3)
        for j in range(3)
    ]

    mean = float(a.mean())
    maximum = float(a.max())
    high = float((a >= .75).mean() * 100)
    strongest = regions[int(np.argmax(scores))]
    center = float(scores[4])

    border = np.concatenate([
        a[:40].ravel(),
        a[-40:].ravel(),
        a[:, :40].ravel(),
        a[:, -40:].ravel()
    ])

    boundary = float(border.mean())
    concentration = min(float(a.std() * 2), 1)

    return {
        "map": a,
        "meanAttention": round(mean, 3),
        "maximumAttention": round(maximum, 3),
        "highAttentionPercentage": round(high, 2),
        "strongestRegion": strongest,
        "centralRegionScore": round(center, 3),
        "boundaryAttention": round(boundary, 3),
        "concentrationScore": round(concentration, 3)
    }


def level(x):
    return "High" if x >= .67 else "Medium" if x >= .34 else "Low"


# Main analysis
def analyze_image(image_bytes):

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(tensor)
        probs = torch.softmax(output, 1)
        confidence, prediction = probs.max(1)

    predicted = idx_to_class[prediction.item()]
    confidence = confidence.item() * 100

    probabilities = {
        idx_to_class[i]: round(
            probs[0, i].item() * 100, 2
        )
        for i in range(len(class_to_idx))
    }

    analysis = analyze_attention(
        get_attention(tensor)
    )

    a = (analysis.pop("map") * 255).astype(np.uint8)

    heatmap = cv2.applyColorMap(
        a,
        cv2.COLORMAP_JET
    )

    original = np.array(
        image.resize((224, 224))
    )

    original = cv2.cvtColor(
        original,
        cv2.COLOR_RGB2BGR
    )

    overlay = cv2.addWeighted(
        original, .6, heatmap, .4, 0
    )

    concentration = analysis["concentrationScore"]
    center = analysis["centralRegionScore"]
    boundary = analysis["boundaryAttention"]

    indicators = [
        {
            "name": "Attention Concentration",
            "value": level(concentration),
            "score": concentration
        },
        {
            "name": "Central Region Attention",
            "value": level(center),
            "score": center
        },
        {
            "name": "Boundary Attention",
            "value": level(boundary),
            "score": boundary
        }
    ]

    patterns = [
        f"Strongest model attention is around the "
        f"{analysis['strongestRegion']} region.",
        (
            "Attention is strongly localized."
            if concentration >= .67
            else "Attention is moderately localized."
            if concentration >= .34
            else "Attention is relatively distributed."
        ),
        (
            "High attention is present in the central region."
            if center >= .67
            else "Moderate attention is present in the central region."
            if center >= .34
            else "Low attention is present in the central region."
        ),
        (
            "Elevated attention is present near image boundaries."
            if boundary >= .67
            else "Moderate attention is present near image boundaries."
            if boundary >= .34
            else "Boundary attention is relatively low."
        ),
        f"{analysis['highAttentionPercentage']}% of the image receives high attention."
    ]

    reasoning = (
        f"The ViT model classified this image as "
        f"{predicted} with {confidence:.2f}% confidence. "
        f"The strongest model attention is around the "
        f"{analysis['strongestRegion']} region. "
        f"Approximately {analysis['highAttentionPercentage']}% "
        f"of the image receives high attention. "
        f"This heatmap provides model interpretability and "
        f"should not be treated as definitive forensic evidence."
    )

    return {
        "success": True,

        "prediction": {
            "class": predicted,
            "confidence": round(confidence, 2)
        },

        "probabilities": probabilities,

        "heatmap": {
            "originalImage": encode(original),
            "image": encode(heatmap),
            "overlay": encode(overlay)
        },

        "attentionAnalysis": analysis,

        "keyIndicators": indicators,

        "visualPatterns": patterns,

        "reasoning": reasoning
    }