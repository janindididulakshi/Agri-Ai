import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ShapChart({ shapData }) {
  if (!shapData?.labels?.length) return null;
  return (
    <div className="sf-card">
      <div style={{ fontWeight: 800, marginBottom: 8 }}>SHAP — බලපෑම්</div>
      <div style={{ height: 260 }}>
        <Bar
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: { legend: { display: false } },
          }}
          data={{
            labels: shapData.labels,
            datasets: shapData.datasets || [
              {
                label: "SHAP",
                data: shapData.values || [],
                backgroundColor: "rgba(45,122,58,0.65)",
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
