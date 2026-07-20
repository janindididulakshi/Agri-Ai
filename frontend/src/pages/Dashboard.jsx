import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiMessageSquare, FiBarChart2, FiShoppingCart, FiEye } from "react-icons/fi";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import WeatherCard from "../components/WeatherCard.jsx";

// Quick Access Card Component
function QuickAccessCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "grid",
        gap: 12,
        padding: 24,
        background: "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: 16,
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.3s ease",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = "0 8px 24px rgba(15,81,50,0.12)";
        e.target.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        e.target.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontSize: 32, color: "var(--sf-primary)" }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e24" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#6c757d", marginTop: 2 }}>{description}</div>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { unreadCount } = useNotifications();
  const [wx, setWx] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [serverAlerts, setServerAlerts] = useState([]);
  const [err, setErr] = useState("");

  const greeting = useMemo(() => user?.full_name || "ගොවි මිත්‍රයා", [user]);
  const firstName = greeting.split(" ")[0];
  const dateStr = useMemo(() => new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }), []);

  const latestCrop = consultations[0];
  const confPct = latestCrop?.confidence_score != null ? Math.round(Number(latestCrop.confidence_score) * 100) : null;

  const healthDerived = useMemo(() => {
    const h = wx?.humidity ?? 50;
    const r = wx?.rainfall_mm ?? 0;
    const moisture = Math.min(95, Math.round(35 + h * 0.35 + Math.min(r * 3, 25)));
    const nitrogen = confPct != null ? Math.min(90, Math.round(18 + confPct * 0.45)) : 28;
    const pestRisk = Math.min(40, Math.round(12 + (r > 5 ? 8 : 0)));
    return { moisture, nitrogen, pestRisk };
  }, [wx, confPct]);

  const loadAll = async (lat, lon) => {
    try {
      setErr("");
      const { data } = await api.get("/weather/gps", { params: { lat, lon } });
      setWx(data);
    } catch (e) {
      setErr(e?.message || "කාලගුණ දත්ත ලබා ගැනීම අසාර්ථකයි.");
    }
    try {
      const c = await api.get("/consultations/recent", { params: { limit: 6 } });
      setConsultations(c.data.consultations || []);
    } catch {
      /* ignore */
    }
    try {
      const a = await api.get("/alerts");
      setServerAlerts((a.data.alerts || []).slice(0, 6).map((x) => x.message));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    let timer;
    const tick = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (p) => loadAll(p.coords.latitude, p.coords.longitude),
        () => {},
        { enableHighAccuracy: true, timeout: 15000 }
      );
    };
    tick();
    timer = window.setInterval(tick, 30 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const mergedAlerts = useMemo(() => {
    const a = [...(wx?.alerts || []), ...serverAlerts];
    return Array.from(new Set(a));
  }, [wx, serverAlerts]);

  const heavyRain = wx && Number(wx.rainfall_mm ?? 0) >= 8;
  const showWarnBanner = heavyRain || mergedAlerts.length > 0;

  const strip7 = (wx?.forecast_7d || []).slice(0, 7);

  return (
    <div className="gov-page" style={{ paddingBottom: 160, position: "relative", minHeight: "100vh" }}>
      {/* Background Image */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/dashboard_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: -2,
        transform: "scale(1.05)",
      }} />
      {/* Light Overlay for Readability */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: -1,
      }} />

      {/* Main Dashboard Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center", marginBottom: 32, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginBottom: 6, textShadow: "0 2px 12px rgba(255,255,255,0.8)" }}>
            Welcome, {firstName}!
          </div>
          <div style={{ fontSize: 15, color: "#334155", fontWeight: 600, textShadow: "0 2px 12px rgba(255,255,255,0.8)" }}>
            Daily predictions & alerts · {dateStr}
          </div>
        </div>

        <button
          type="button"
          onClick={() => nav("/app/predict")}
          style={{
            padding: "12px 20px",
            background: "linear-gradient(135deg, #0bc25c 0%, #0a9648 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(15, 81, 50, 0.2)",
            whiteSpace: "nowrap",
          }}
        >
          + New Analysis
        </button>
      </div>

      {/* Main Content Grid - 2 Column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 40 }}>
        {/* Left Column */}
        <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
          {/* Weather Card */}
          {wx && <WeatherCard data={wx} />}

          {/* 7-Day Outlook */}
          {strip7.length > 0 && (
            <div style={{ background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 20, padding: 24, border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
                  7-Day Outlook
                </div>
                <div style={{ color: "#10b981" }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              </div>

              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Forecast and farming advisory</div>

              <div style={{ display: "grid", gap: 12 }}>
                {strip7.slice(0, 7).map((d, i) => (
                  <div key={d.date || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(255, 255, 255, 0.5)", borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                    <div style={{ color: "#0f172a", width: 40 }}>
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", width: 50 }}>
                      Jul {17 + i}
                    </div>
                    <div style={{ color: "#334155", width: 70, textAlign: "center" }}>
                      {Math.round(d.temp_min ?? 25)}–{Math.round(d.temp_max ?? 32)}°C
                    </div>
                    <div style={{ color: "#64748b", width: 60, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      ☁️ {Number(d.rain_mm ?? 0).toFixed(0)} mm
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "rgba(220, 252, 231, 0.7)", color: "#065f46", fontSize: 13, lineHeight: 1.5, fontWeight: 600, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                Advisory: keep irrigation moderate midweek and avoid spraying before Thursday rain.
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
          {/* Crop Health Analysis */}
          <div style={{ background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 20, padding: 24, border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>
                  Crop Health Analysis
                </div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  SHAP explainability snapshot
                </div>
              </div>
              <div style={{ width: 36, height: 36, background: "#dcfce7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                ✨
              </div>
            </div>

            <div style={{ display: "grid", gap: 24, marginTop: 24 }}>
              {/* Soil Moisture */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  <span>Soil moisture</span>
                  <span style={{ color: "#64748b" }}>82%</span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "82%", background: "#10b981", borderRadius: 4 }} />
                </div>
              </div>

              {/* Nitrogen */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  <span>Nitrogen / nutrition signal</span>
                  <span style={{ color: "#64748b" }}>68%</span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "68%", background: "#10b981", borderRadius: 4 }} />
                </div>
              </div>

              {/* Pest Risk */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  <span>Pest risk</span>
                  <span style={{ color: "#64748b" }}>24%</span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "24%", background: "#ef4444", borderRadius: 4 }} />
                </div>
              </div>
            </div>

            {/* AI Note */}
            <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: "rgba(220, 252, 231, 0.7)", color: "#065f46", fontSize: 13, lineHeight: 1.5, fontWeight: 600, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              Irrigate lightly this evening and scout leaf undersides tomorrow morning for early pest signs.
            </div>
          </div>

          {/* Details Card */}
          <div style={{ background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 20, padding: 24, border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>Details</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>
                  Latest<br/>recommendation
                </div>
              </div>
              <button type="button" style={{ background: "#f1f5f9", border: "none", color: "#475569", fontWeight: 600, fontSize: 12, padding: "6px 14px", borderRadius: "999px", cursor: "pointer" }}>
                Edit
              </button>
            </div>
            
            <div style={{ background: "rgba(255, 255, 255, 0.5)", borderRadius: 16, padding: 20, border: "1px solid rgba(255, 255, 255, 0.4)" }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 8, fontWeight: 700 }}>Recommended crop</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 24 }}>
                {latestCrop?.crop_name || "Rice"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Confidence</div>
                <div style={{ background: "#dcfce7", color: "#10b981", fontWeight: 800, fontSize: 13, padding: "4px 12px", borderRadius: "999px" }}>
                  {confPct || 92}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div style={{ marginBottom: 40, position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 20, textShadow: "0 2px 12px rgba(255,255,255,0.8)" }}>
          Quick access
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          <QuickAccessCard
            icon={<FiMessageSquare size={28} />}
            title="Chat"
            description="Messaging"
            onClick={() => nav("/app/chat")}
          />
          <QuickAccessCard
            icon={<FiEye size={28} />}
            title="Crop suggestion"
            description="Predict"
            onClick={() => nav("/app/predict")}
          />
          <QuickAccessCard
            icon={<FiShoppingCart size={28} />}
            title="Marketplace"
            description="Listings"
            onClick={() => nav("/app/market")}
          />
          <QuickAccessCard
            icon={<FiBarChart2 size={28} />}
            title="Reports"
            description="Charts"
            onClick={() => nav("/app/reports")}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--sf-border)", paddingTop: 24, marginTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontSize: 13, color: "#6c757d", fontWeight: 500 }}>
          © 2026 Govi AI Precision Farming. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 500 }}>
          <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#0bc25c" }}>
            Privacy Policy
          </button>
          <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#0bc25c" }}>
            Terms of Service
          </button>
          <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#0bc25c" }}>
            API Status
          </button>
        </div>
      </div>
    </div>
  );
}
