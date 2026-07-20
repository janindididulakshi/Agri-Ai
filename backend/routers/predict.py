from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user
from models.db_models import FarmConsultation, Farmer
from services import weather_service
from services.ml_service import CROP_NAMES_SI, predict_crop as ml_predict_crop
from services.shap_service import explain_prediction

router = APIRouter(prefix="/predict", tags=["predict"])


class PredictBody(BaseModel):
    soil_type: str
    water_source: str
    sunlight: float = 6.0
    previous_crop: str = "none"
    lat: float
    lon: float


def _fertilizer_en(crop_en: str) -> str:
    tips = {
        "rice": "As per Sri Lanka's DOA guidelines, apply Urea and MOP in balanced splits. For the Dry Zone (Maha season), consult local agrarian centers for base dressing.",
        "maize": "Apply Urea + Super Phosphate. Adjust dosage based on the growth stage typical for Anuradhapura and Ampara districts.",
        "tea": "Use Urea/Organic mixtures cyclically. Refer to Tea Research Institute (TRI) guidelines for elevation-specific (Up/Mid/Low country) applications.",
        "coconut": "Apply Magnesium-rich mixtures (e.g. Adult Palm Mixture) after the monsoon rains as advised by the Coconut Research Institute (CRI).",
        "banana": "Apply liquid fertilizer and Phosphate. Establish a structured nutrition program before fruiting, especially for local varieties like Embul and Kolikuttu.",
        "tomato": "Use Calcium Nitrate-based fertilizers. Reduce dosage during fruiting to prevent blossom end rot, a common issue in Sri Lankan climates.",
        "carrot": "Boost with Phosphate during the mid-growth stage. Ideal for Nuwara Eliya and Badulla cooler climates.",
        "mango": "Use Potassium-heavy fertilizers. Apply carefully before the flowering stage (ahead of the Yala season) to maximize yield.",
        "pepper": "Apply organic liquid extracts and essential micronutrients suited for Sri Lanka's wet and intermediate zones.",
    }
    return tips.get(crop_en, "Consult your local Department of Agriculture (DOA) extension officer for a customized fertilizer plan.")


def _reason_en(crop_en: str, conf: float) -> str:
    return (
        f"Based on your specific soil type, water availability, and local weather data, "
        f"'{crop_en.capitalize()}' is highly recommended for cultivation "
        f"({conf*100:.0f}% confidence). Please review the feature importance chart below to see exactly which environmental factors drove this AI recommendation."
    )


@router.post("")
async def predict_crop(
    body: PredictBody,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    try:
        cw = await weather_service.fetch_current_weather(body.lat, body.lon)
        main = cw.get("main", {})
        rain = cw.get("rain", {}).get("1h") or cw.get("rain", {}).get("3h") or 0
        feats = {
            "soil_type": body.soil_type,
            "water_source": body.water_source,
            "sunlight": body.sunlight,
            "previous_crop": body.previous_crop,
            "temperature": float(main.get("temp", 28)),
            "humidity": float(main.get("humidity", 75)),
            "rainfall": float(rain),
        }
        crop_si, crop_en, confidence, _ = ml_predict_crop(feats)
        shap_raw = explain_prediction(feats)

        shap_data = {
            "labels": shap_raw["labels"],
            "datasets": [
                {
                    "label": "SHAP",
                    "data": shap_raw["values"],
                    "backgroundColor": "rgba(45,122,58,0.6)",
                }
            ],
        }

        fert = _fertilizer_en(crop_en)
        reason = _reason_en(crop_en, confidence)

        cons = FarmConsultation(
            farmer_id=user.id,
            soil_type=body.soil_type,
            water_source=body.water_source,
            recommended_crop=crop_en,
            confidence_score=confidence,
            weather_data=feats,
            shap_values=shap_data,
            fertilizer_rec=fert,
        )
        db.add(cons)
        db.commit()

        return {
            "crop_sinhala": crop_si,
            "crop_english": crop_en,
            "confidence": confidence,
            "reason": reason,
            "fertilizer": fert,
            "shap_data": shap_data,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"නිර්දේශය අසාර්ථකයි: {str(e)}")
