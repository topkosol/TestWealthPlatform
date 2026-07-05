export function fmtMoney(v: number, ccy?: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: ccy || "USD", maximumFractionDigits: 0 }).format(v);
  } catch {
    return "$" + Math.round(v).toLocaleString();
  }
}

export function fmtCompact(v: number, ccy?: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
      style: "currency",
      currency: ccy || "USD",
    }).format(v);
  } catch {
    return (ccy || "$") + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);
  }
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
