export default function AlertCard({ alerts }) {
  if (!alerts?.length) return null;
  return (
    <div className="sf-grid" style={{ gap: 10 }}>
      {alerts.map((a, idx) => (
        <div
          key={idx}
          className="gov-card"
          style={{
            borderColor: "rgba(244,67,54,0.35)",
            background: "color-mix(in srgb, rgba(244,67,54,0.12) 40%, var(--sf-card))",
          }}
        >
          <div style={{ fontWeight: 800 }}>{a}</div>
        </div>
      ))}
    </div>
  );
}
