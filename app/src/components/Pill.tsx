import type { CSSProperties, ReactNode } from "react";

export default function Pill({ bg, fg, children, style }: { bg: string; fg: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        background: bg,
        color: fg,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
