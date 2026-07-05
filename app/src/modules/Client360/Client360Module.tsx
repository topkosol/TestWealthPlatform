import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { ACCENT, STATUS_META } from "../../theme";
import { fmtMoney, fmtCompact } from "../../utils/format";
import DonutChart from "./DonutChart";
import TrendChart from "./TrendChart";
import "./Client360Module.css";

type ClientTab = "personal" | "account" | "risk" | "holdings";

const TABS: { key: ClientTab; label: string }[] = [
  { key: "personal", label: "Personal & Contact" },
  { key: "account", label: "Account Details" },
  { key: "risk", label: "Risk & Suitability" },
  { key: "holdings", label: "Product Holdings" },
];

export default function Client360Module() {
  const { clients, selectedClientId, setSelectedClientId } = useApp();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ClientTab>("personal");

  const filteredClients = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [clients, search]
  );

  const client = clients.find((c) => c.id === selectedClientId) || clients[0];
  const kycMeta = STATUS_META[client.kycStatus];
  const segBg = client.segment === "Private" ? "#EAF4EE" : "#FBF3E2";
  const segColor = client.segment === "Private" ? "#1F5F4A" : "#8A6A2A";

  return (
    <div className="client-module">
      <div className="client-list-panel">
        <div className="client-list-search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter clients…"
            className="client-list-search-input"
            aria-label="Filter clients by name"
          />
        </div>
        <div className="client-list-scroll">
          {filteredClients.map((c) => {
            const active = c.id === selectedClientId;
            const cSegBg = c.segment === "Private" ? "#EAF4EE" : "#FBF3E2";
            const cSegColor = c.segment === "Private" ? "#1F5F4A" : "#8A6A2A";
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={`Select client ${c.name}`}
                className="client-list-row"
                style={{ background: active ? "#F0F5F1" : "#fff" }}
                onClick={() => { setSelectedClientId(c.id); setTab("personal"); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedClientId(c.id); setTab("personal"); } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 13.3, fontWeight: 700, color: "#182620" }}>{c.name}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: cSegColor, background: cSegBg, padding: "2px 7px", borderRadius: 20 }}>{c.segment}</span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(24,38,32,0.5)", marginTop: 3 }}>{fmtCompact(c.totalAUM)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="client-detail-panel">
        <div className="client-card">
          <div className="client-card-header">
            <div>
              <div className="client-name">{client.name}</div>
              <div className="client-id">{client.id} · RM {client.rm}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="client-tag" style={{ background: segBg, color: segColor }}>{client.segment}</span>
              <span className="client-tag" style={{ background: "#EAF1F5", color: "#3B6E8F" }}>{client.riskProfile}</span>
              <span className="client-tag" style={{ background: kycMeta.bg, color: kycMeta.fg }}>KYC {client.kycStatus}</span>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div className="client-aum-label">Total AUM</div>
            <div className="client-aum-value">{fmtMoney(client.totalAUM, "USD")}</div>
          </div>

          <DonutChart breakdown={client.aumBreakdown} total={client.totalAUM} centerLabel={fmtCompact(client.totalAUM)} />

          <TrendChart trend={client.aumTrend} />
        </div>

        <div className="client-tabs-card">
          <div className="client-tabs-bar" role="tablist" aria-label="Client information sections">
            {TABS.map((t) => (
              <div
                key={t.key}
                role="tab"
                tabIndex={tab === t.key ? 0 : -1}
                aria-selected={tab === t.key}
                aria-controls={`client-tabpanel-${t.key}`}
                id={`client-tab-${t.key}`}
                className="client-tab"
                style={{ color: tab === t.key ? "#182620" : "rgba(24,38,32,0.45)", borderBottom: `2px solid ${tab === t.key ? ACCENT : "transparent"}` }}
                onClick={() => setTab(t.key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTab(t.key); } }}
              >
                {t.label}
              </div>
            ))}
          </div>

          {tab === "personal" && (
            <div
              id="client-tabpanel-personal"
              role="tabpanel"
              aria-labelledby="client-tab-personal"
              className="client-tab-grid"
            >
              <Field label="Email" value={client.contact.email} />
              <Field label="Phone" value={client.contact.phone} />
              <Field label="Address" value={client.contact.address} />
              <Field label="Date of Birth" value={client.contact.dob} />
              <Field label="Nationality" value={client.contact.nationality} />
            </div>
          )}

          {tab === "account" && (
            <div
              id="client-tabpanel-account"
              role="tabpanel"
              aria-labelledby="client-tab-account"
              className="client-tab-grid"
            >
              <Field label="Account Number" value={client.accountDetails.accountNumber} />
              <Field label="Account Type" value={client.accountDetails.accountType} />
              <Field label="Base Currency" value={client.accountDetails.baseCurrency} />
              <Field label="Opened" value={client.accountDetails.openDate} />
              <Field label="Custodian" value={client.accountDetails.custodian} />
            </div>
          )}

          {tab === "risk" && (
            <div
              id="client-tabpanel-risk"
              role="tabpanel"
              aria-labelledby="client-tab-risk"
              className="client-tab-grid"
            >
              <Field label="Risk Profile" value={client.riskProfile} />
              <Field label="KYC Status" value={client.kycStatus} />
              <div style={{ gridColumn: "1/-1" }}>
                <div className="client-field-label">Suitability Note</div>
                <div className="client-field-value" style={{ lineHeight: 1.6 }}>
                  Portfolio composition assessed against client's stated risk tolerance and investment horizon.
                  Structured product exposure capped per segment policy; annual suitability review scheduled per KYC cycle.
                </div>
              </div>
            </div>
          )}

          {tab === "holdings" && (
            <div
              id="client-tabpanel-holdings"
              role="tabpanel"
              aria-labelledby="client-tab-holdings"
              style={{ padding: "8px 8px 18px" }}
            >
              <table className="client-holdings-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Product</th>
                    <th style={{ textAlign: "left" }}>Asset Class</th>
                    <th style={{ textAlign: "right" }}>Value</th>
                    <th style={{ textAlign: "right" }}>YTD Return</th>
                  </tr>
                </thead>
                <tbody>
                  {client.holdings.map((h, i) => {
                    const retColor = h.ytdReturn >= 0 ? "#1F5F4A" : "#B3453A";
                    const retLabel = (h.ytdReturn >= 0 ? "+" : "") + h.ytdReturn + "%";
                    // Use composite key: product name + asset class + index as fallback
                    // since holdings may contain duplicate product names across asset classes
                    return (
                      <tr key={`${h.product}-${h.assetClass}-${i}`}>
                        <td style={{ fontWeight: 600 }}>{h.product}</td>
                        <td style={{ color: "rgba(24,38,32,0.6)" }}>{h.assetClass}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtMoney(h.value, h.currency)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: retColor }}>{retLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="client-field-label">{label}</div>
      <div className="client-field-value">{value}</div>
    </div>
  );
}
