import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).resolve().parent.parent / "ml_models" / "artifacts"
MODEL_PATH = MODEL_DIR / "crop_xgb.json"
META_PATH = MODEL_DIR / "crop_meta.joblib"

CROPS_EN = [
    "rice",
    "maize",
    "tea",
    "coconut",
    "banana",
    "tomato",
    "carrot",
    "mango",
    "pepper",
]

CROP_NAMES_SI = {
    "rice": "හාල්",
    "maize": "ඉරිඟු",
    "tea": "තේ",
    "coconut": "පොල්",
    "banana": "කෙසෙල්",
    "tomato": "තක්කාලි",
    "carrot": "කැරට්",
    "mango": "අඹ",
    "pepper": "ගම්මිරිස්",
}


def ensure_model_dir():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_or_train(force_train: bool = False) -> Tuple[xgb.XGBClassifier, Dict[str, Any]]:
    ensure_model_dir()
    if not force_train and MODEL_PATH.exists() and META_PATH.exists():
        meta = joblib.load(META_PATH)
        clf = xgb.XGBClassifier()
        clf.load_model(str(MODEL_PATH))
        return clf, meta
    from ml_models.train_model import train_and_save

    return train_and_save()


def encode_row(meta: Dict[str, Any], row: Dict[str, Any]) -> np.ndarray:
    soil = str(row.get("soil_type", "")).lower()
    water = str(row.get("water_source", "")).lower()
    sun = float(row.get("sunlight", 6) or 6)
    prev = str(row.get("previous_crop", "none") or "none").lower()
    temp = float(row.get("temperature", 28) or 28)
    hum = float(row.get("humidity", 75) or 75)
    rain = float(row.get("rainfall", 5) or 5)

    cats = meta["categories"]
    soil_i = cats["soil_type"].get(soil, 0)
    water_i = cats["water_source"].get(water, 0)
    prev_i = cats["previous_crop"].get(prev, 0)

    X = np.array([[soil_i, water_i, sun, prev_i, temp, hum, rain]], dtype=float)
    return X


def predict_crop(features: Dict[str, Any]) -> Tuple[str, str, float, Dict[str, Any]]:
    clf, meta = load_or_train()
    X = encode_row(meta, features)
    probs = clf.predict_proba(X)[0]
    idx = int(np.argmax(probs))
    crop_en = meta["classes"][idx]
    confidence = float(probs[idx])
    crop_si = CROP_NAMES_SI.get(crop_en, crop_en)
    detail = {"probabilities": {meta["classes"][i]: float(probs[i]) for i in range(len(probs))}}
    return crop_si, crop_en, confidence, detail
