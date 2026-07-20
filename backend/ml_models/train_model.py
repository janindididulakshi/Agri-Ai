"""
Train default XGBoost crop classifier when no artifact exists.
"""
import logging
import random
from pathlib import Path
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb

from services.ml_service import CROPS_EN, MODEL_DIR, META_PATH, MODEL_PATH

logger = logging.getLogger(__name__)


SOILS = ["clay", "loam", "sandy", "red_loam", "alluvial"]
WATERS = ["rainfed", "canal", "well", "drip", "sprinkler"]
PREV = ["none", "rice", "maize", "vegetables", "tea", "coconut"]


def build_dataset(n: int = 2500) -> Tuple[pd.DataFrame, np.ndarray]:
    rng = random.Random(42)
    rows = []
    y = []
    for _ in range(n):
        soil = rng.choice(SOILS)
        water = rng.choice(WATERS)
        sun = rng.uniform(4, 12)
        prev = rng.choice(PREV)
        temp = rng.uniform(22, 34)
        hum = rng.uniform(55, 92)
        rain = rng.uniform(0, 25)

        soil_i = SOILS.index(soil)
        water_i = WATERS.index(water)
        prev_i = PREV.index(prev)

        score_rice = 0
        score_maize = 0
        score_tea = 0
        score_coconut = 0
        score_banana = 0
        score_tomato = 0
        score_carrot = 0
        score_mango = 0
        score_pepper = 0

        if rain > 12 and soil in ("clay", "alluvial"):
            score_rice += 3
        if sun > 8 and water in ("drip", "well"):
            score_tomato += 2
            score_pepper += 1
        if hum > 78 and temp < 30:
            score_tea += 2
        if soil == "sandy" and sun > 9:
            score_coconut += 2
            score_banana += 1
        if soil == "loam" and sun > 7:
            score_carrot += 1
            score_maize += 2
        if temp > 28 and rain < 8:
            score_mango += 2
        if water == "rainfed" and rain < 6:
            score_pepper += 1

        scores = {
            "rice": score_rice + (5 if rain > 15 else 0),
            "maize": score_maize + rng.random(),
            "tea": score_tea + (2 if hum > 80 else 0),
            "coconut": score_coconut + rng.random(),
            "banana": score_banana + (2 if hum > 75 else 0),
            "tomato": score_tomato + (2 if sun > 7 else 0),
            "carrot": score_carrot + (1 if temp < 26 else 0),
            "mango": score_mango + rng.random(),
            "pepper": score_pepper + (1 if sun > 8 else 0),
        }

        crop = max(scores, key=scores.get)

        rows.append(
            {
                "soil_idx": soil_i,
                "water_idx": water_i,
                "sunlight": sun,
                "prev_idx": prev_i,
                "temperature": temp,
                "humidity": hum,
                "rainfall": rain,
            }
        )
        y.append(CROPS_EN.index(crop))

    X = pd.DataFrame(rows)
    return X, np.array(y)


def train_and_save() -> Tuple[xgb.XGBClassifier, Dict[str, Any]]:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    X, y = build_dataset()
    clf = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=6,
        learning_rate=0.08,
        objective="multi:softprob",
        num_class=len(CROPS_EN),
        random_state=42,
        n_jobs=2,
    )
    clf.fit(X.values, y)
    clf.save_model(str(MODEL_PATH))

    meta: Dict[str, Any] = {
        "classes": CROPS_EN,
        "categories": {
            "soil_type": {s: i for i, s in enumerate(SOILS)},
            "water_source": {w: i for i, w in enumerate(WATERS)},
            "previous_crop": {p: i for i, p in enumerate(PREV)},
        },
        "feature_order": [
            "soil_idx",
            "water_idx",
            "sunlight",
            "prev_idx",
            "temperature",
            "humidity",
            "rainfall",
        ],
    }
    joblib.dump(meta, META_PATH)
    logger.info("Trained crop model saved to %s", MODEL_PATH)

    loaded = xgb.XGBClassifier()
    loaded.load_model(str(MODEL_PATH))
    return loaded, meta
