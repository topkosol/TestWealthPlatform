import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ACCENT, STATUS_META } from "../../theme";
import { fmtMoney } from "../../utils/format";
import type { Currency, Order } from "../../types";
import "./StructuredOrderModule.css";

const COUPON_BASE: Record<string, number> = {
  "Autocall Memory": 8.5,
  "Reverse Convertible": 6.8,
  "Twin-Win": 5.4,
  "Fixed Coupon": 4.2,
};

type QuoteState = "idle" | "loading" | "quoted";

export default function StructuredOrderModule() {
  const { clients, underlyingOptions, orders, setOrders } = useApp();

  const [underlyings, setUnderlyings] = useState<string[]>([]);
  const [tenor, setTenor] = useState("3Y");
  const [couponType, setCouponType] = useState("Autocall Memory");
  const [barrier, setBarrier] = useState(65);
  const [notional, setNotional] = useState(250000);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [error, setError] = useState("");
  const [quoteState, setQuoteState] = useState<QuoteState>("idle");
  const [quote, setQuote] = useState<{ coupon: number; price: number } | null>(null);
  const [bookSuccess, setBookSuccess] = useState(false);

  function toggleUnderlying(name: string) {
    setUnderlyings((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  function requestQuote() {
    if (underlyings.length === 0) return setError("Select at least one underlying.");
    if (!notional || notional <= 0) return setError("Enter a valid notional.");
    if (!clientId) return setError("Select a client account.");
    setError("");
    setQuoteState("loading");
    setQuote(null);
    setBookSuccess(false);
    const base = COUPON_BASE[couponType] || 6;
    const barrierAdj = (90 - barrier) * 0.06;
    // NOTE: This uses a deterministic offset seeded from form inputs for the mock/demo only.
    // In production, indicative quotes MUST be fetched from a pricing server over an authenticated API.
    // Never derive financial quotes client-side using Math.random() or any PRNG.
    const mockSeed = (underlyings.length * 0.3 + barrier * 0.01 + notional * 0.000001) % 1;
    const coupon = +(base + barrierAdj + (mockSeed * 1.2 - 0.6)).toFixed(2);
    const price = +(99.4 + mockSeed * 1.2).toFixed(2);
    setTimeout(() => {
      setQuoteState("quoted");
      setQuote({ coupon, price });
    }, 1200);
  }

  function bookOrder() {
    if (!quote) return;
    const client = clients.find((c) => c.id === clientId);
    // Generate a collision-resistant ID based on timestamp rather than list length,
    // since list length shifts when orders are filtered or removed.
    const order: Order = {
      id: "ORD-" + (Date.now() % 1_000_000),
      clientId,
      clientName: client ? client.name : "",
      underlyings: [...underlyings],
      tenor,
      barrier,
      couponType,
      notional,
      currency,
      status: "Booked",
      quote: { indicativeCoupon: quote.coupon, indicativePrice: quote.price },
      createdDate: new Date().toISOString().slice(0, 10),
    };
    setOrders((prev) => [order, ...prev]);
    setQuoteState("idle");
    setQuote(null);
    setUnderlyings([]);
    setNotional(250000);
    setError("");
    setBookSuccess(true);
    setTimeout(() => setBookSuccess(false), 3500);
  }

  return (
    <div className="so-module">
      <div className="so-form-card">
        <div className="so-form-title">Build a Structured Note Request</div>

        <div className="so-label">Underlying(s)</div>
        <div className="so-chip-row" role="group" aria-label="Select underlyings">
          {underlyingOptions.map((name) => {
            const active = underlyings.includes(name);
            return (
              <div
                key={name}
                role="checkbox"
                aria-checked={active}
                tabIndex={0}
                className="so-chip"
                style={{
                  background: active ? ACCENT : "#fff",
                  color: active ? "#fff" : "#182620",
                  border: `1px solid ${active ? ACCENT : "rgba(20,30,25,0.15)"}`,
                }}
                onClick={() => toggleUnderlying(name)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleUnderlying(name); } }}
              >
                {name}
              </div>
            );
          })}
        </div>

        <div className="so-grid-2">
          <div>
            <div className="so-label">Tenor</div>
            <select value={tenor} onChange={(e) => setTenor(e.target.value)} className="so-input">
              <option value="1Y">1 Year</option>
              <option value="2Y">2 Years</option>
              <option value="3Y">3 Years</option>
              <option value="5Y">5 Years</option>
            </select>
          </div>
          <div>
            <div className="so-label">Coupon Type</div>
            <select value={couponType} onChange={(e) => setCouponType(e.target.value)} className="so-input">
              <option value="Autocall Memory">Autocall Memory</option>
              <option value="Reverse Convertible">Reverse Convertible</option>
              <option value="Twin-Win">Twin-Win</option>
              <option value="Fixed Coupon">Fixed Coupon</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div className="so-barrier-label">
            <span>Barrier</span>
            <span style={{ color: "#182620" }}>{barrier}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={90}
            step={5}
            value={barrier}
            onChange={(e) => setBarrier(parseInt(e.target.value, 10))}
            style={{ width: "100%" }}
            aria-label={`Barrier level: ${barrier}%`}
            aria-valuemin={40}
            aria-valuemax={90}
            aria-valuenow={barrier}
            aria-valuetext={`${barrier}%`}
          />
        </div>

        <div className="so-grid-2">
          <div>
            <div className="so-label">Notional</div>
            <input
              type="number"
              value={notional}
              onChange={(e) => setNotional(parseInt(e.target.value, 10) || 0)}
              className="so-input"
              aria-label="Notional amount"
              min={1}
            />
          </div>
          <div>
            <div className="so-label">Currency</div>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="so-input">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CHF">CHF</option>
              <option value="GBP">GBP</option>
              <option value="SGD">SGD</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div className="so-label">Client Account</div>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="so-input">
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {error && <div className="so-error" role="alert" aria-live="assertive">{error}</div>}

        <button className="so-quote-btn" onClick={requestQuote}>
          {quoteState === "loading" ? "Requesting quote…" : "Request Quotation"}
        </button>

        {quoteState === "quoted" && quote && (
          <div className="so-quote-box">
            <div className="so-quote-heading">Indicative Quote</div>
            <div className="so-quote-row">
              <span>Coupon (p.a.)</span>
              <span style={{ fontWeight: 800, color: "#182620" }}>{quote.coupon}%</span>
            </div>
            <div className="so-quote-row" style={{ marginBottom: 0 }}>
              <span>Indicative Price</span>
              <span style={{ fontWeight: 800, color: "#182620" }}>{quote.price}</span>
            </div>
          </div>
        )}
        {quoteState === "quoted" && (
          <button className="so-book-btn" style={{ background: ACCENT }} onClick={bookOrder}>Book Order</button>
        )}

        <div role="status" aria-live="polite" aria-atomic="true">
          {bookSuccess && <div className="so-success">Order booked successfully</div>}
        </div>
      </div>

      <div className="so-orders-card">
        <div className="so-orders-title">Requests & Orders</div>
        <table className="so-orders-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Order</th>
              <th style={{ textAlign: "left" }}>Client</th>
              <th style={{ textAlign: "left" }}>Underlying</th>
              <th style={{ textAlign: "right" }}>Notional</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const meta = STATUS_META[o.status];
              return (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.id}</td>
                  <td>{o.clientName}</td>
                  <td style={{ color: "rgba(24,38,32,0.6)" }}>{o.underlyings.join(", ")}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtMoney(o.notional, o.currency)}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className="so-status-pill" style={{ background: meta.bg, color: meta.fg }}>{o.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
