export const ACCENT = "#1F5F4A";

export const COLORS = {
  bg: "#F7F8F6",
  text: "#182620",
  textMuted: "rgba(24,38,32,0.5)",
  textMutedLight: "rgba(24,38,32,0.4)",
  textMutedStrong: "rgba(24,38,32,0.6)",
  border: "rgba(20,30,25,0.08)",
  borderStrong: "rgba(20,30,25,0.12)",
  sidebarBg: "#15382C",
  card: "#FFFFFF",
  red: "#B3453A",
  redBg: "#FBEEEC",
  gold: "#C9A85C",
  goldFg: "#8A6A2A",
  goldBg: "#FBF3E2",
  green: "#1F5F4A",
  greenBg: "#EAF4EE",
  blueFg: "#3B6E8F",
  blueBg: "#EAF1F5",
};

export const PRIORITY_META: Record<string, { bg: string; fg: string; dot: string }> = {
  High: { bg: "#FBEEEC", fg: "#B3453A", dot: "#B3453A" },
  Medium: { bg: "#FBF3E2", fg: "#8A6A2A", dot: "#C9A85C" },
  Low: { bg: "#EAF4EE", fg: "#1F5F4A", dot: "#1F5F4A" },
};

export const STATUS_META: Record<string, { bg: string; fg: string }> = {
  Verified: { bg: "#EAF4EE", fg: "#1F5F4A" },
  "Pending Review": { bg: "#FBF3E2", fg: "#8A6A2A" },
  Expired: { bg: "#FBEEEC", fg: "#B3453A" },
  Settled: { bg: "#EAF4EE", fg: "#1F5F4A" },
  Pending: { bg: "#FBF3E2", fg: "#8A6A2A" },
  Failed: { bg: "#FBEEEC", fg: "#B3453A" },
  Booked: { bg: "#EAF4EE", fg: "#1F5F4A" },
  Quoted: { bg: "#EAF1F5", fg: "#3B6E8F" },
  Rejected: { bg: "#FBEEEC", fg: "#B3453A" },
};

export const SEG_META: Record<string, { label: string; color: string }> = {
  equities: { label: "Equities", color: "#1F5F4A" },
  fixedIncome: { label: "Fixed Income", color: "#3E8368" },
  structuredProducts: { label: "Structured Products", color: "#C9A85C" },
  funds: { label: "Funds", color: "#7FAE95" },
  cash: { label: "Cash", color: "#C9C4B4" },
};

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
