import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";
import { FiCommand, FiActivity, FiFeather } from "react-icons/fi"; // for icons
import { useLang } from "../context/LanguageContext.jsx";

const localTranslations = {
  EN: {
    soilType: "Soil Type",
    waterSource: "Water Source",
    prevCrop: "Previous Crop",
    sunlightHrs: "Sunlight Hours",
    lat: "GPS Latitude",
    lon: "GPS Longitude",
    predictBtnText: "Get Recommendation",
    recCrop: "Recommended Crop",
    confidence: "confidence",
    fertAdvice: "Fertilizer Advice",
    shapTitle: "SHAP Feature Importance",
    shapDesc: "Higher value = stronger influence",
    soils: { clay: "Clay", loam: "Loam", sandy: "Sandy", red_loam: "Red Loam", alluvial: "Alluvial" },
    waters: { rainfed: "Rainfed", canal: "Canal", well: "Well", drip: "Drip", sprinkler: "Sprinkler" },
    prevs: { none: "None", rice: "Rice", maize: "Maize", vegetables: "Vegetables", tea: "Tea", coconut: "Coconut" },
    failedPred: "Prediction failed."
  },
  SI: {
    soilType: "පස වර්ගය",
    waterSource: "ජල මූලාශ්‍රය",
    prevCrop: "පෙර බෝගය",
    sunlightHrs: "හිරු එළිය (පැය)",
    lat: "GPS අක්ෂාංශ",
    lon: "GPS දේශාංශ",
    predictBtnText: "නිර්දේශය ගන්න",
    recCrop: "නිර්දේශිත බෝගය",
    confidence: "විශ්වාසය",
    fertAdvice: "පොහොර උපදෙස්",
    shapTitle: "SHAP වැදගත්කම",
    shapDesc: "ඉහළ අගය = වැඩි බලපෑමක්",
    soils: { clay: "ක්ලේ මැටි", loam: "ලෝම් මැටි", sandy: "වැලි", red_loam: "රත් ලෝම්", alluvial: "ගංගා අපටු මැටි" },
    waters: { rainfed: "වර්ෂා ජලය", canal: "වාරි කලපුව", well: "ලොල් කටුව", drip: "බිංදු වාරි", sprinkler: "ස්‍ප්‍රින්ක්ලර්" },
    prevs: { none: "නැත", rice: "හාල්", maize: "ඉරිඟු", vegetables: "එළවළු", tea: "තේ", coconut: "පොල්" },
    failedPred: "නිර්දේශය අසාර්ථකයි."
  },
  TA: {
    soilType: "மண் வகை",
    waterSource: "நீர் ஆதாரம்",
    prevCrop: "முந்தைய பயிர்",
    sunlightHrs: "சூரிய ஒளி (மணி)",
    lat: "அட்சரேகை",
    lon: "தீர்க்கரேகை",
    predictBtnText: "பரிந்துரையைப் பெறவும்",
    recCrop: "பரிந்துரைக்கப்பட்ட பயிர்",
    confidence: "நம்பிக்கை",
    fertAdvice: "உர ஆலோசனை",
    shapTitle: "SHAP முக்கியத்துவம்",
    shapDesc: "அதிக மதிப்பு = வலுவான செல்வாக்கு",
    soils: { clay: "களிமண்", loam: "களிமண் கலவை", sandy: "மணல்", red_loam: "சிவப்பு களிமண்", alluvial: "வண்டல்" },
    waters: { rainfed: "மழைநீர்ப்பாசனம்", canal: "கால்வாய்", well: "கிணறு", drip: "சொட்டு நீர்", sprinkler: "தெளிப்பான்" },
    prevs: { none: "இல்லை", rice: "அரிசி", maize: "சோளம்", vegetables: "காய்கறிகள்", tea: "தேநீர்", coconut: "தேங்காய்" },
    failedPred: "கணிப்பு தோல்வியடைந்தது."
  }
};

export default function Predict() {
  const [soil_type, setSoil] = useState("clay");
  const [water_source, setWater] = useState("rainfed");
  const [sunlight, setSun] = useState("");
  const [previous_crop, setPrev] = useState("none");
  const [lat, setLat] = useState("6.9271");
  const [lon, setLon] = useState("79.8612");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const { lang, t: globalT } = useLang();
  const t = (key) => localTranslations[lang?.toUpperCase()]?.[key] || globalT(key) || key;

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(p.coords.latitude.toFixed(4));
        setLon(p.coords.longitude.toFixed(4));
      },
      () => {},
      { timeout: 12000 }
    );
  }, []);

  const disabled = useMemo(() => !lat || !lon, [lat, lon]);

  const run = async () => {
    try {
      setErr("");
      const { data } = await api.post("/predict", {
        soil_type,
        water_source,
        sunlight: Number(sunlight || 7.5),
        previous_crop,
        lat: Number(lat),
        lon: Number(lon),
      });
      setResult(data);
    } catch (e) {
      setErr(e?.message || t("failedPred"));
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <img src="/logo.jpg" alt="Govi AI" style={{ height: "48px", width: "auto", borderRadius: "12px", objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase" }}>Govi AI</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              {t("cropRecommendationTitle")}
            </div>
          </div>
        </div>
        <button 
          onClick={run}
          disabled={disabled}
          style={{ background: "#0bc25c", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "999px", fontWeight: 700, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1, letterSpacing: "0.5px" }}
        >
          <FiActivity size={20} strokeWidth={2.5} /> {t("predictBtn")}
        </button>
      </div>

      {err && (
        <div style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5", padding: "16px", borderRadius: "12px", fontWeight: 600 }}>
          {err}
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "start" }}>
        
        {/* Left Column: Form */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", boxShadow: "0 10px 25px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>{t("inputParamsTitle")}</h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 32px" }}>{t("inputParamsSubtitle")}</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>{t("soilType")}</label>
              <select style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "15px", color: "#334155", outline: "none" }} value={soil_type} onChange={(e) => setSoil(e.target.value)}>
                {Object.keys(localTranslations.EN.soils).map((k) => <option key={k} value={k}>{t("soils")[k]}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>{t("waterSource")}</label>
              <select style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "15px", color: "#334155", outline: "none" }} value={water_source} onChange={(e) => setWater(e.target.value)}>
                {Object.keys(localTranslations.EN.waters).map((k) => <option key={k} value={k}>{t("waters")[k]}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>{t("prevCrop")}</label>
              <select style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "15px", color: "#334155", outline: "none" }} value={previous_crop} onChange={(e) => setPrev(e.target.value)}>
                {Object.keys(localTranslations.EN.prevs).map((k) => <option key={k} value={k}>{t("prevs")[k]}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>{t("sunlightHrs")}</label>
              <input type="number" step="0.1" placeholder="e.g. 7.5" style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "15px", color: "#334155", outline: "none" }} value={sunlight} onChange={(e) => setSun(e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>{t("lat")}</label>
                <input style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "15px", color: "#334155", outline: "none" }} value={lat} onChange={(e) => setLat(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>{t("lon")}</label>
                <input style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "15px", color: "#334155", outline: "none" }} value={lon} onChange={(e) => setLon(e.target.value)} />
              </div>
            </div>

            <button 
              type="button" 
              disabled={disabled} 
              onClick={run}
              style={{ background: "#6edb9f", color: "#fff", border: "none", padding: "16px", borderRadius: "12px", fontWeight: 800, fontSize: "18px", marginTop: "16px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1, transition: "background 0.2s", letterSpacing: "0.5px" }}
            >
              {t("predictBtnText")}
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Recommendation Card */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", boxShadow: "0 10px 25px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>{t("recCrop")}</div>
                  <div style={{ fontSize: "32px", fontWeight: 900, color: "#1e293b" }}>{result.crop_english} / {result.crop_sinhala}</div>
                </div>
                <div style={{ background: "#dcfce7", color: "#16a34a", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 800 }}>
                  {Math.round(Number(result.confidence) * 100)}% {t("confidence")}
                </div>
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", fontSize: "14px", color: "#334155", lineHeight: "1.6", marginBottom: "24px" }}>
                {result.reason}
              </div>

              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, color: "#d97706", marginBottom: "12px", fontSize: "15px" }}>
                  <span>🌱</span> {t("fertAdvice")}
                </div>
                <div style={{ fontSize: "14px", color: "#b45309", lineHeight: "1.6" }}>
                  {result.fertilizer}
                </div>
              </div>
            </div>

            {/* SHAP Chart Card */}
            {result.shap_data && result.shap_data.labels && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", boxShadow: "0 10px 25px rgba(0,0,0,0.02)" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>{t("shapTitle")}</h2>
                <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px" }}>{t("shapDesc")}</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {result.shap_data.labels.map((label, i) => {
                    const val = result.shap_data.values?.[i] || 0;
                    // Find max value to normalize widths
                    const maxVal = Math.max(...(result.shap_data.values || [1]));
                    const widthPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    
                    return (
                      <div key={label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                          <span>{label}</span>
                          <span>{val.toFixed(2)}</span>
                        </div>
                        <div style={{ background: "#f1f5f9", height: "12px", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ background: "#0bc25c", height: "100%", width: `${widthPercent}%`, borderRadius: "999px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: "32px", padding: "12px 20px", background: "#f8fafc", borderRadius: "12px", fontSize: "13px", color: "#64748b", fontWeight: 600, display: "inline-block" }}>
                  {t("shapDesc")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
