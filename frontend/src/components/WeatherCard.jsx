import { FiMapPin, FiSun } from "react-icons/fi";

export default function WeatherCard({ data }) {
  if (!data) return null;
  const iconUrl = data.icon ? `https://openweathermap.org/img/wn/${data.icon}@4x.png` : "";
  const sr = (ts) => ts ? new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div style={{ background: "linear-gradient(135deg, #a1f8d5ff 0%, #50f437ff 100%)", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
      {/* Decorative background blurs */}
      <div style={{ position: "absolute", top: "-50%", left: "-20%", width: "100%", height: "100%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", bottom: "-50%", right: "-20%", width: "100%", height: "100%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }}></div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ color: "#94a3b8", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <FiMapPin size={18} color="#10b981" /> {data.location || "—"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "64px", fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
              {Math.round(data.temperature_c ?? 0)}°
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", color: "#e2e8f0", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              Feels like {Math.round(data.feels_like_c ?? data.temperature_c ?? 0)}°
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#f8fafc", textTransform: "capitalize", marginBottom: "8px" }}>
            {data.description}
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>
            Sunrise {sr(data.sunrise)} - Sunset {sr(data.sunset)}
          </div>
        </div>
        <div style={{ width: "72px", height: "72px", background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}>
          {iconUrl ? (
            <img alt="" src={iconUrl} style={{ width: "120%", height: "120%", filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.3))", objectFit: "contain" }} />
          ) : (
            <FiSun size={32} color="#10b981" />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "40px", position: "relative", zIndex: 1 }}>
        <Metric label="Humidity" value={`${Math.round(data.humidity ?? 0)}%`} />
        <Metric label="Rainfall" value={`${Number(data.rainfall_mm ?? 0).toFixed(1)}\nmm`} />
        <Metric label="Wind" value={`${(Number(data.wind_speed_ms ?? 0) * 3.6).toFixed(0)}\nkm/h`} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "20px 16px", textAlign: "center" }}>
      <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 900, color: "#fff", whiteSpace: "pre-line", lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}
