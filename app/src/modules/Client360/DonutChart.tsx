import { SEG_META } from "../../theme";
import { fmtCompact } from "../../utils/format";
import type { AumBreakdown } from "../../types";

export default function DonutChart({ breakdown, total, centerLabel }: { breakdown: AumBreakdown; total: number; centerLabel: string }) {
  const circumference = 2 * Math.PI * 70;
  let cumulative = 0;
  const segments = (Object.keys(SEG_META) as (keyof AumBreakdown)[]).map((key) => {
    const value = breakdown[key];
    const pct = value / total;
    const dash = pct * circumference;
    const seg = {
      key,
      label: SEG_META[key].label,
      color: SEG_META[key].color,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -cumulative,
      pctLabel: (pct * 100).toFixed(1) + "%",
      valueLabel: fmtCompact(value),
    };
    cumulative += dash;
    return seg;
  });

  return (
    <div style={{ display: "flex", gap: 28, marginTop: 24, flexWrap: "wrap" }}>
      <div style={{ flex: "none" }}>
        <svg width="176" height="176" viewBox="0 0 180 180">
          {segments.map((seg) => (
            <circle
              key={seg.key}
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              transform="rotate(-90 90 90)"
              strokeLinecap="butt"
            />
          ))}
          <text x="90" y="86" textAnchor="middle" fontSize="11" fill="rgba(24,38,32,0.5)" fontWeight="600">ASSET MIX</text>
          <text x="90" y="104" textAnchor="middle" fontSize="15" fill="#182620" fontWeight="800">{centerLabel}</text>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", justifyContent: "center", gap: 9 }}>
        {segments.map((seg) => (
          <div key={seg.key} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
            <div style={{ width: 9, height: 9, borderRadius: 3, background: seg.color, flex: "none" }} />
            <div style={{ flex: 1, color: "#182620", fontWeight: 600 }}>{seg.label}</div>
            <div style={{ color: "rgba(24,38,32,0.55)" }}>{seg.pctLabel}</div>
            <div style={{ width: 90, textAlign: "right", fontWeight: 700, color: "#182620" }}>{seg.valueLabel}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
