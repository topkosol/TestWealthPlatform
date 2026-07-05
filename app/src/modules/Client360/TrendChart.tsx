import { useState } from "react";
import { ACCENT } from "../../theme";
import { fmtCompact } from "../../utils/format";

const MONTH_LABELS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

export default function TrendChart({ trend }: { trend: number[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const minV = Math.min(...trend);
  const maxV = Math.max(...trend);
  const range = Math.max(1, maxV - minV);
  const dots = trend.map((v, i) => {
    const x = 20 + i * (440 / 11);
    const y = 130 - ((v - minV) / range) * 110;
    return { index: i, x, y, value: v, month: MONTH_LABELS[i] };
  });
  const points = dots.map((d) => `${d.x},${d.y}`).join(" ");
  const axisLabels = dots.filter((_, i) => i % 2 === 0);

  let hovered: { boxX: number; boxY: number; textX: number; month: string; valueLabel: string } | null = null;
  if (hoveredIndex !== null) {
    const d = dots[hoveredIndex];
    const boxX = Math.min(Math.max(d.x - 43, 4), 480 - 90);
    hovered = { boxX, boxY: Math.max(d.y - 48, 2), textX: boxX + 43, month: d.month, valueLabel: fmtCompact(d.value) };
  }

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontSize: 11.5, color: "rgba(24,38,32,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 10 }}>
        AUM trend — trailing 12 months
      </div>
      <svg width="100%" height="150" viewBox="0 0 480 150" style={{ overflow: "visible" }}>
        <polyline points={points} fill="none" stroke={ACCENT} strokeWidth="2.5" />
        {dots.map((d) => (
          <g key={d.index} onMouseEnter={() => setHoveredIndex(d.index)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: "pointer" }}>
            <circle cx={d.x} cy={d.y} r="9" fill="transparent" />
            <circle cx={d.x} cy={d.y} r="3.2" fill={ACCENT} />
          </g>
        ))}
        {hovered && (
          <g>
            <rect x={hovered.boxX} y={hovered.boxY} width="86" height="36" rx="6" fill="#182620" />
            <text x={hovered.textX} y={hovered.boxY} dy="15" textAnchor="middle" fontSize="10.5" fill="rgba(255,255,255,0.65)" fontWeight="600">{hovered.month}</text>
            <text x={hovered.textX} y={hovered.boxY} dy="29" textAnchor="middle" fontSize="11.5" fill="#fff" fontWeight="700">{hovered.valueLabel}</text>
          </g>
        )}
        {axisLabels.map((lbl) => (
          <text key={lbl.index} x={lbl.x} y="146" textAnchor="middle" fontSize="10" fill="rgba(24,38,32,0.4)">{lbl.month}</text>
        ))}
      </svg>
    </div>
  );
}
