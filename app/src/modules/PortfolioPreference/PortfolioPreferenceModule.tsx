import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { SEG_META } from "../../theme";
import { fmtMoney, fmtCompact } from "../../utils/format";
import type { AumBreakdown, RiskProfile } from "../../types";
import DonutChart from "../Client360/DonutChart";
import { ASSET_KEYS, MODEL_PORTFOLIOS, RISK_PROFILES, type AssetKey } from "./modelPortfolios";
import "./PortfolioPreferenceModule.css";

const DRIFT_THRESHOLD_PCT = 0.5; // ignore drift below this % of total AUM

function weightsFromModel(risk: RiskProfile): Record<AssetKey, number> {
  return { ...MODEL_PORTFOLIOS[risk] };
}

function adjustWeights(weights: Record<AssetKey, number>, changedKey: AssetKey, rawValue: number): Record<AssetKey, number> {
  const clamped = Math.min(100, Math.max(0, rawValue));
  const others = ASSET_KEYS.filter((k) => k !== changedKey);
  const othersTotal = others.reduce((s, k) => s + weights[k], 0);
  const remaining = 100 - clamped;
  const next = { ...weights, [changedKey]: clamped } as Record<AssetKey, number>;

  if (othersTotal <= 0) {
    others.forEach((k, i) => { next[k] = i === 0 ? remaining : 0; });
    return next;
  }

  let used = 0;
  others.forEach((k, i) => {
    if (i === others.length - 1) {
      next[k] = Math.max(0, +(remaining - used).toFixed(1));
    } else {
      const share = weights[k] / othersTotal;
      const v = Math.max(0, +(remaining * share).toFixed(1));
      next[k] = v;
      used += v;
    }
  });
  return next;
}

export default function PortfolioPreferenceModule() {
  const { clients, selectedClientId, setSelectedClientId } = useApp();
  const [search, setSearch] = useState("");
  const [targetRisk, setTargetRisk] = useState<RiskProfile>("Balanced");
  const [weights, setWeights] = useState<Record<AssetKey, number>>(weightsFromModel("Balanced"));

  const client = clients.find((c) => c.id === selectedClientId) || clients[0];

  const filteredClients = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [clients, search]
  );

  // Reset the target preference to the client's own risk profile whenever the selected client changes.
  useEffect(() => {
    setTargetRisk(client.riskProfile);
    setWeights(weightsFromModel(client.riskProfile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  const targetBreakdown: AumBreakdown = {
    equities: Math.round((weights.equities / 100) * client.totalAUM),
    fixedIncome: Math.round((weights.fixedIncome / 100) * client.totalAUM),
    structuredProducts: Math.round((weights.structuredProducts / 100) * client.totalAUM),
    funds: Math.round((weights.funds / 100) * client.totalAUM),
    cash: Math.round((weights.cash / 100) * client.totalAUM),
  };

  const weightsSum = ASSET_KEYS.reduce((s, k) => s + weights[k], 0);

  const tradeRows = useMemo(() => {
    const thresholdValue = (DRIFT_THRESHOLD_PCT / 100) * client.totalAUM;
    return ASSET_KEYS.map((key) => {
      const currentValue = client.aumBreakdown[key];
      const targetValue = targetBreakdown[key];
      const diff = targetValue - currentValue;
      const currentPct = (currentValue / client.totalAUM) * 100;
      return {
        key,
        label: SEG_META[key].label,
        color: SEG_META[key].color,
        currentValue,
        targetValue,
        currentPct,
        targetPct: weights[key],
        diff,
        action: Math.abs(diff) < thresholdValue ? "Hold" : diff > 0 ? "Buy" : "Sell",
      };
    }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [client, targetBreakdown, weights]);

  const activeTrades = tradeRows.filter((r) => r.action !== "Hold");

  function handleRiskSelect(risk: RiskProfile) {
    setTargetRisk(risk);
    setWeights(weightsFromModel(risk));
  }

  function handleSlider(key: AssetKey, value: number) {
    setWeights((w) => adjustWeights(w, key, value));
  }

  return (
    <div className="port-pref-module">
      <div className="port-pref-list-panel">
        <div className="port-pref-list-search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter clients…"
            className="port-pref-list-search-input"
            aria-label="Filter clients by name"
          />
        </div>
        <div className="port-pref-list-scroll">
          {filteredClients.map((c) => {
            const active = c.id === selectedClientId;
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={`Select client ${c.name}`}
                className="port-pref-list-row"
                style={{ background: active ? "#F0F5F1" : "#fff" }}
                onClick={() => setSelectedClientId(c.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedClientId(c.id); } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 13.3, fontWeight: 700, color: "#182620" }}>{c.name}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "#3B6E8F", background: "#EAF1F5", padding: "2px 7px", borderRadius: 20 }}>{c.riskProfile}</span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(24,38,32,0.5)", marginTop: 3 }}>{fmtCompact(c.totalAUM)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="port-pref-detail-panel">
        <div className="port-pref-card">
          <div className="port-pref-card-header">
            <div>
              <div className="port-pref-client-name">{client.name}</div>
              <div className="port-pref-client-id">{client.id} · Current risk profile: {client.riskProfile}</div>
            </div>
            <div>
              <div className="port-pref-aum-label">Total AUM</div>
              <div className="port-pref-aum-value">{fmtMoney(client.totalAUM, "USD")}</div>
            </div>
          </div>

          <div className="port-pref-risk-selector">
            <div className="port-pref-risk-selector-label">Target risk preference</div>
            <div className="port-pref-risk-selector-buttons" role="tablist" aria-label="Target risk preference">
              {RISK_PROFILES.map((r) => (
                <div
                  key={r}
                  role="tab"
                  tabIndex={0}
                  aria-selected={targetRisk === r}
                  className="port-pref-risk-btn"
                  style={{
                    background: targetRisk === r ? "#1F5F4A" : "#fff",
                    color: targetRisk === r ? "#fff" : "#182620",
                    borderColor: targetRisk === r ? "#1F5F4A" : "rgba(20,30,25,0.12)",
                  }}
                  onClick={() => handleRiskSelect(r)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleRiskSelect(r); } }}
                >
                  {r}
                </div>
              ))}
              <div
                role="button"
                tabIndex={0}
                className="port-pref-reset-btn"
                onClick={() => setWeights(weightsFromModel(targetRisk))}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setWeights(weightsFromModel(targetRisk)); } }}
              >
                Reset to model
              </div>
            </div>
          </div>

          <div className="port-pref-donuts">
            <div className="port-pref-donut-col">
              <div className="port-pref-donut-title">Current Allocation</div>
              <DonutChart breakdown={client.aumBreakdown} total={client.totalAUM} centerLabel={fmtCompact(client.totalAUM)} />
            </div>
            <div className="port-pref-donut-col">
              <div className="port-pref-donut-title">Target Allocation ({targetRisk})</div>
              <DonutChart breakdown={targetBreakdown} total={client.totalAUM} centerLabel={fmtCompact(client.totalAUM)} />
            </div>
          </div>

          <div className="port-pref-sliders">
            <div className="port-pref-sliders-header">
              <span>Adjust target weights</span>
              <span style={{ color: Math.abs(weightsSum - 100) > 0.6 ? "#B3453A" : "rgba(24,38,32,0.5)" }}>
                Total {weightsSum.toFixed(1)}%
              </span>
            </div>
            {ASSET_KEYS.map((key) => (
              <div key={key} className="port-pref-slider-row">
                <div className="port-pref-slider-label">
                  <span className="port-pref-slider-dot" style={{ background: SEG_META[key].color }} />
                  {SEG_META[key].label}
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={weights[key]}
                  aria-label={`${SEG_META[key].label} target weight`}
                  onChange={(e) => handleSlider(key, parseFloat(e.target.value))}
                  className="port-pref-slider-input"
                />
                <div className="port-pref-slider-value">{weights[key].toFixed(1)}%</div>
                <div className="port-pref-slider-target-value">{fmtCompact(targetBreakdown[key])}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="port-pref-trades-card">
          <div className="port-pref-trades-header">
            <div className="port-pref-trades-title">Recommended Rebalance Trades</div>
            <div className="port-pref-trades-subtitle">
              {activeTrades.length === 0
                ? "Portfolio is within tolerance of the target allocation — no trades needed."
                : `${activeTrades.length} trade${activeTrades.length > 1 ? "s" : ""} to align with target allocation`}
            </div>
          </div>
          <table className="port-pref-trades-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Asset Class</th>
                <th style={{ textAlign: "right" }}>Current</th>
                <th style={{ textAlign: "right" }}>Target</th>
                <th style={{ textAlign: "right" }}>Drift</th>
                <th style={{ textAlign: "center" }}>Action</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {tradeRows.map((row) => {
                const actionBg = row.action === "Buy" ? "#EAF4EE" : row.action === "Sell" ? "#FBEEEC" : "#F1F2EF";
                const actionFg = row.action === "Buy" ? "#1F5F4A" : row.action === "Sell" ? "#B3453A" : "rgba(24,38,32,0.5)";
                return (
                  <tr key={row.key}>
                    <td style={{ fontWeight: 600 }}>
                      <span className="port-pref-slider-dot" style={{ background: row.color, marginRight: 8 }} />
                      {row.label}
                    </td>
                    <td style={{ textAlign: "right" }}>{fmtCompact(row.currentValue)} <span style={{ color: "rgba(24,38,32,0.45)" }}>({row.currentPct.toFixed(1)}%)</span></td>
                    <td style={{ textAlign: "right" }}>{fmtCompact(row.targetValue)} <span style={{ color: "rgba(24,38,32,0.45)" }}>({row.targetPct.toFixed(1)}%)</span></td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: row.diff > 0 ? "#1F5F4A" : row.diff < 0 ? "#B3453A" : "rgba(24,38,32,0.5)" }}>
                      {row.diff > 0 ? "+" : ""}{fmtCompact(row.diff)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: actionBg, color: actionFg }}>{row.action}</span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{row.action === "Hold" ? "—" : fmtCompact(Math.abs(row.diff))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
