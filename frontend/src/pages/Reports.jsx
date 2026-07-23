import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiGrid, FiFeather, FiMessageCircle } from "react-icons/fi";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";

const localTranslations = {
  EN: {
    reportTitle: "Report Section",
    reportSubtitle: "Monthly farm performance overview",
    downloadPdf: "Download PDF",
    farmSize: "Farm Size",
    managedIn: "Managed across 3 plots in",
    cropType: "Crop Type",
    primaryCrop: "Primary crop with seasonal monitoring enabled",
    consultations: "Consultations",
    expertSessions: "Expert advice sessions completed this month",
    loading: "Loading...",
    mainCrop: "Main Crop",
    revenue: "Revenue (LKR)",
    alerts: "Alerts",
    monthlyConsultations: "Monthly Consultations",
    avgTemp: "Average Temperature",
    noWeatherLogs: "Not enough weather logs — Refresh weather via Dashboard.",
    avgTempC: "Avg temp °C",
    errLoad: "Failed to load report.",
    errPdf: "Failed to download PDF."
  },
  SI: {
    reportTitle: "වාර්තා අංශය",
    reportSubtitle: "මාසික ගොවිපල කාර්යසාධනය පිළිබඳ දළ විශ්ලේෂණය",
    downloadPdf: "PDF බාගන්න",
    farmSize: "ගොවිපල ප්‍රමාණය",
    managedIn: "ඉඩම් කට්ටි 3 ක කළමනාකරණය -",
    cropType: "බෝග වර්ගය",
    primaryCrop: "සෘතුමය අධීක්ෂණය සහිත ප්‍රධාන බෝගය",
    consultations: "උපදේශන",
    expertSessions: "මෙම මාසයේ සම්පූර්ණ කළ උපදේශන සැසි",
    loading: "පූරණය වෙමින්...",
    mainCrop: "ප්‍රධාන බෝගය",
    revenue: "ආදායම (රු.)",
    alerts: "ඇඟවීම්",
    monthlyConsultations: "මාසික උපදේශන",
    avgTemp: "සාමාන්‍ය උෂ්ණත්වය",
    noWeatherLogs: "කාලගුණ දත්ත ප්‍රමාණවත් නැත — උපකරණ පුවරුවෙන් යාවත්කාලීන කරන්න.",
    avgTempC: "සාමාන්‍ය උෂ්ණත්වය °C",
    errLoad: "වාර්තාව ලබා ගැනීම අසාර්ථකයි.",
    errPdf: "PDF බාගැනීම අසාර්ථකයි."
  },
  TA: {
    reportTitle: "அறிக்கை பிரிவு",
    reportSubtitle: "மாதாந்திர பண்ணை செயல்திறன் கண்ணோட்டம்",
    downloadPdf: "PDF ஐப் பதிவிறக்குக",
    farmSize: "பண்ணை அளவு",
    managedIn: "3 மனைகளில் நிர்வகிக்கப்படுகிறது -",
    cropType: "பயிர் வகை",
    primaryCrop: "பருவகால கண்காணிப்புடன் முக்கிய பயிர்",
    consultations: "ஆலோசனைகள்",
    expertSessions: "இந்த மாதம் முடிக்கப்பட்ட நிபுணர் ஆலோசனை அமர்வுகள்",
    loading: "ஏற்றுகிறது...",
    mainCrop: "முக்கிய பயிர்",
    revenue: "வருவாய் (ரூ.)",
    alerts: "விழிப்பூட்டல்கள்",
    monthlyConsultations: "மாதாந்திர ஆலோசனைகள்",
    avgTemp: "சராசரி வெப்பநிலை",
    noWeatherLogs: "போதிய வானிலை பதிவுகள் இல்லை - டாஷ்போர்டு மூலம் வானிலையை புதுப்பிக்கவும்.",
    avgTempC: "சராசரி வெப்பநிலை °C",
    errLoad: "அறிக்கையை ஏற்ற முடியவில்லை.",
    errPdf: "PDF பதிவிறக்கம் தோல்வி."
  }
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Reports() {
  const { user } = useAuth();
  const { lang, t: globalT } = useLang();
  const t = (key) => localTranslations[lang?.toUpperCase()]?.[key] || globalT(key) || key;
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");

  const farmerId = user?.id;

  const load = async () => {
    if (!farmerId) return;
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get(`/reports/${farmerId}/summary`);
      setSummary(data);
    } catch (e) {
      setErr(e?.message || t("errLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, [farmerId]);

  const consultChart = useMemo(() => {
    const rows = summary?.consultations_by_month || [];
    return {
      labels: rows.map((r) => r.month),
      datasets: [
        {
          label: t("consultations"),
          data: rows.map((r) => r.count),
          backgroundColor: "#0bc25c",
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [summary]);

  const wxChart = useMemo(() => {
    const rows = summary?.weather_avg_by_month || [];
    return {
      labels: rows.map((r) => r.month),
      datasets: [
        {
          label: t("avgTempC"),
          data: rows.map((r) => r.avg_temp),
          backgroundColor: "#d97706",
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [summary]);

  const downloadPdf = async () => {
    if (!farmerId) return;
    try {
      const res = await api.get(`/reports/${farmerId}/annual`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `farm_report_${farmerId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e?.message || t("errPdf"));
    }
  };

  const chartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: { legend: { display: false } },
     scales: {
       x: { grid: { display: false }, ticks: { color: "#64748b", font: { weight: 600 } } },
       y: { grid: { color: "#f1f5f9" }, ticks: { color: "#64748b" }, beginAtZero: true }
     }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
           <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>{t("reportTitle")}</h1>
           <div style={{ fontSize: 14, color: "#64748b" }}>{t("reportSubtitle")}</div>
        </div>
        <button 
          onClick={downloadPdf}
          style={{ background: "#0bc25c", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 999, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 4px 12px rgba(11, 194, 92, 0.2)" }}
        >
          <FiDownload size={16} /> {t("downloadPdf")}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 32 }}>
        <DetailedStat title={t("alerts")} value={String(summary?.orders_count ?? 0)} subtitle={`Total marketplace orders in ${user?.location || "your area"}`} icon={FiGrid} />
        <DetailedStat title={t("cropType")} value={summary?.top_crop || "—"} subtitle={t("primaryCrop")} icon={FiFeather} />
        <DetailedStat title={t("consultations")} value={String(summary?.total_consultations ?? 0)} subtitle={t("expertSessions")} icon={FiMessageCircle} />
      </div>

      {loading ? <div style={{ color: "#64748b", fontWeight: 600, marginBottom: 24 }}>{t("loading")}</div> : null}
      {err ? <div style={{ padding: 16, background: "#fee2e2", color: "#ef4444", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>{err}</div> : null}

      {summary ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 32 }}>
          <Stat title={t("consultations")} value={String(summary.total_consultations ?? 0)} />
          <Stat title={t("mainCrop")} value={String(summary.top_crop || "—")} />
          <Stat title={t("revenue")} value={Number(summary.sales_total_lkr || 0).toFixed(0)} />
          <Stat title={t("alerts")} value={String(summary.orders_count ?? 0)} />
        </div>
      ) : null}

      {summary ? (
        <>
          <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{t("monthlyConsultations")}</div>
               <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>{new Date().getFullYear()}</div>
            </div>
            <div style={{ height: 280 }}>
              {summary.consultations_by_month?.length ? (
                <Bar data={consultChart} options={chartOptions} />
              ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94a3b8", fontWeight: 600 }}>No consultation data available for this year.</div>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{t("avgTemp")}</div>
               <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>{new Date().getFullYear()}</div>
            </div>
            <div style={{ height: 280 }}>
              {summary.weather_avg_by_month?.length ? (
                <Bar data={wxChart} options={chartOptions} />
              ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94a3b8", fontWeight: 600 }}>{t("noWeatherLogs")}</div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontWeight: 900, fontSize: 28, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

function DetailedStat({ title, value, subtitle, icon: Icon }) {
  return (
    <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
         <div>
           <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>
             {title}
           </div>
           <div style={{ fontWeight: 900, fontSize: 28, color: "#0f172a" }}>{value}</div>
         </div>
         <div style={{ color: "#0bc25c", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#dcfce7", borderRadius: 12 }}>
           <Icon size={20} />
         </div>
      </div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.4, fontWeight: 500 }}>
        {subtitle}
      </div>
    </div>
  );
}
