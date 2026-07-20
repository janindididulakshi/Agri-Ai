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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Reports() {
  const { user } = useAuth();
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
      setErr(e?.message || "වාර්තාව ලබා ගැනීම අසාර්ථකයි.");
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
          label: "Consultations",
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
          label: "Avg temp °C",
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
      setErr(e?.message || "PDF බාගැනීම අසාර්ථකයි.");
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
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 32px", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
           <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>Report Section</h1>
           <div style={{ fontSize: 14, color: "#64748b" }}>Monthly farm performance overview</div>
        </div>
        <button 
          onClick={downloadPdf}
          style={{ background: "#0bc25c", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 999, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 4px 12px rgba(11, 194, 92, 0.2)" }}
        >
          <FiDownload size={16} /> Download PDF
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 32 }}>
        <DetailedStat title="Farm Size" value="7.2 ha" subtitle={`Managed across 3 plots in ${user?.location || "Kandy District"}`} icon={FiGrid} />
        <DetailedStat title="Crop Type" value={summary?.top_crop || "Tea"} subtitle="Primary crop with seasonal monitoring enabled" icon={FiFeather} />
        <DetailedStat title="Consultations" value={String(summary?.total_consultations || 12)} subtitle="Expert advice sessions completed this month" icon={FiMessageCircle} />
      </div>

      {loading ? <div style={{ color: "#64748b", fontWeight: 600, marginBottom: 24 }}>Loading...</div> : null}
      {err ? <div style={{ padding: 16, background: "#fee2e2", color: "#ef4444", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>{err}</div> : null}

      {summary ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          <Stat title="Consultations" value={String(summary.total_consultations ?? 0)} />
          <Stat title="Main Crop" value={String(summary.top_crop || "—")} />
          <Stat title="Revenue (LKR)" value={Number(summary.sales_total_lkr || 0).toFixed(0)} />
          <Stat title="Alerts" value={String(summary.orders_count ?? 0)} />
        </div>
      ) : null}

      {summary?.consultations_by_month?.length ? (
        <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
             <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Monthly Consultations</div>
             <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>2026-07</div>
          </div>
          <div style={{ height: 280 }}>
            <Bar data={consultChart} options={chartOptions} />
          </div>
        </div>
      ) : null}

      {summary?.weather_avg_by_month?.length ? (
        <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
             <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Average Temperature</div>
             <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>2026-07</div>
          </div>
          <div style={{ height: 280 }}>
            <Bar data={wxChart} options={chartOptions} />
          </div>
        </div>
      ) : (
        <div style={{ color: "#64748b", fontWeight: 600, padding: 24, background: "#f8fafc", borderRadius: 16, textAlign: "center" }}>Not enough weather logs — Refresh weather via Dashboard.</div>
      )}
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
