from typing import Any, Dict, List

import numpy as np
import shap

from services.ml_service import CROP_NAMES_SI, encode_row, load_or_train

FEATURE_KEYS = [
    "soil_type",
    "water_source",
    "sunlight",
    "previous_crop",
    "temperature",
    "humidity",
    "rainfall",
]

LABELS_SI = {
    "soil_type": "පස් වර්ගය",
    "water_source": "ජල මූලාශ්‍රය",
    "sunlight": "අව්ව ප්‍රමාණය",
    "previous_crop": "පෙර වගාව",
    "temperature": "උෂ්ණත්වය",
    "humidity": "ආර්ද්‍රතාව",
    "rainfall": "වර්ෂාපාතය",
}


def explain_prediction(features: Dict[str, Any]) -> Dict[str, Any]:
    clf, meta = load_or_train()
    X = encode_row(meta, features)
    explainer = shap.TreeExplainer(clf)
    sv = explainer.shap_values(X)
    pred_idx = int(np.argmax(clf.predict_proba(X)[0]))
    if isinstance(sv, list):
        shap_vals = sv[pred_idx][0]
    elif sv.ndim == 3:
        shap_vals = sv[0, :, pred_idx]
    else:
        shap_vals = sv[0]

    pairs = list(zip(FEATURE_KEYS, shap_vals.tolist()))

    chart_labels = [LABELS_SI[k] for k, _ in pairs]
    chart_values = [float(v) for _, v in pairs]

    narrative_si_parts = []
    for k, v in pairs:
        direction = "ධනාත්මක" if v >= 0 else "සෘණාත්මක"
        narrative_si_parts.append(f"{LABELS_SI[k]} ({direction})")

    return {
        "labels": chart_labels,
        "values": chart_values,
        "pairs_si": narrative_si_parts,
        "raw_features": features,
    }
