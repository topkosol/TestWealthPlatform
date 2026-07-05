import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { STATUS_META } from "../../theme";
import { fmtMoney, fmtDate } from "../../utils/format";
import type { Transaction } from "../../types";
import "./TransactionsModule.css";

type SortField = "date" | "clientName" | "productType" | "amount";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 12;

export default function TransactionsModule() {
  const { transactions, clients } = useApp();

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setPage(1); };
  }
  const onSearch = resetPage(setSearch);
  const onClientFilter = resetPage(setClientFilter);
  const onTypeFilter = resetPage(setTypeFilter);
  const onStatusFilter = resetPage(setStatusFilter);
  const onDateFrom = resetPage(setDateFrom);
  const onDateTo = resetPage(setDateTo);

  function onSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    let list = transactions.filter((t) => {
      if (clientFilter !== "All" && t.clientId !== clientFilter) return false;
      if (typeFilter !== "All" && t.productType !== typeFilter) return false;
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!t.clientName.toLowerCase().includes(q) && !t.productName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      let cmp: number;
      if (typeof av === "string" && typeof bv === "string") {
        cmp = av.toLowerCase() < bv.toLowerCase() ? -1 : av.toLowerCase() > bv.toLowerCase() ? 1 : 0;
      } else {
        cmp = av < bv ? -1 : av > bv ? 1 : 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [transactions, clientFilter, typeFilter, statusFilter, dateFrom, dateTo, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const arrow = (field: SortField) => (sortBy === field ? (sortDir === "asc" ? " ▲" : " ▼") : "");

  const headerCell = (field: SortField, label: string, align: "left" | "right" = "left") => (
    <th style={{ textAlign: align, cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => onSort(field)}>
      {label}{arrow(field)}
    </th>
  );

  return (
    <div>
      <div className="tx-title">Historical Transactions</div>

      <div className="tx-filters">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search client or product…"
          className="tx-search-input"
          aria-label="Search by client name or product"
        />
        <select value={clientFilter} onChange={(e) => onClientFilter(e.target.value)} className="tx-select" aria-label="Filter by client">
          <option value="All">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => onTypeFilter(e.target.value)} className="tx-select" aria-label="Filter by product type">
          <option value="All">All product types</option>
          <option value="Structured Note">Structured Note</option>
          <option value="Equity">Equity</option>
          <option value="Fixed Income">Fixed Income</option>
          <option value="Fund">Fund</option>
          <option value="FX">FX</option>
        </select>
        <select value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)} className="tx-select" aria-label="Filter by status">
          <option value="All">All statuses</option>
          <option value="Settled">Settled</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => onDateFrom(e.target.value)} className="tx-select" aria-label="Date from" />
        <span style={{ color: "rgba(24,38,32,0.4)", fontSize: 12 }} aria-hidden="true">to</span>
        <input type="date" value={dateTo} onChange={(e) => onDateTo(e.target.value)} className="tx-select" aria-label="Date to" />
      </div>

      <div className="tx-table-wrap">
        <table className="tx-table">
          <thead>
            <tr>
              {headerCell("date", "Date")}
              {headerCell("clientName", "Client")}
              {headerCell("productType", "Type")}
              <th style={{ textAlign: "left", whiteSpace: "nowrap" }}>Product</th>
              <th style={{ textAlign: "left", whiteSpace: "nowrap" }}>Action</th>
              {headerCell("amount", "Amount", "right")}
              <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((t: Transaction) => {
              const meta = STATUS_META[t.status];
              return (
                <tr key={t.id}>
                  <td style={{ color: "rgba(24,38,32,0.65)", whiteSpace: "nowrap" }}>{fmtDate(t.date)}</td>
                  <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{t.clientName}</td>
                  <td style={{ color: "rgba(24,38,32,0.65)", whiteSpace: "nowrap" }}>{t.productType}</td>
                  <td>{t.productName}</td>
                  <td style={{ color: "rgba(24,38,32,0.65)" }}>{t.action}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{fmtMoney(t.amount, t.currency)}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className="tx-status-pill" style={{ background: meta.bg, color: meta.fg }}>{t.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="tx-footer">
        <div className="tx-result-summary" role="status" aria-live="polite" aria-atomic="true">
          {filtered.length} transaction{filtered.length === 1 ? "" : "s"} found
        </div>
        <div className="tx-pagination">
          <button
            className="tx-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >Prev</button>
          <span className="tx-page-label" aria-live="polite" aria-atomic="true">Page {currentPage} / {totalPages}</span>
          <button
            className="tx-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >Next</button>
        </div>
      </div>
    </div>
  );
}
