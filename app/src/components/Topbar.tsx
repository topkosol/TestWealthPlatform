import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import "./Topbar.css";

const NOTIFICATIONS = [
  { id: 1, title: "KYC document expiring for 2 clients", time: "2h ago", dot: "#B3453A" },
  { id: 2, title: "Indicative quote received for ORD-502", time: "5h ago", dot: "#3E8368" },
  { id: 3, title: "3 notes due today", time: "Today", dot: "#C9A85C" },
];

export default function Topbar() {
  const { clients, rm, goToClient } = useApp();
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close search results and notification panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearch("");
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close notification panel on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [search, clients]);

  return (
    <div className="topbar">
      <div className="topbar-search" ref={searchRef}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" className="topbar-search-icon" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6" />
          <line x1="13" y1="13" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="topbar-search-input"
          aria-label="Search clients"
          aria-autocomplete="list"
          aria-expanded={results.length > 0}
          aria-controls="topbar-search-listbox"
          role="combobox"
        />
        {results.length > 0 && (
          <div id="topbar-search-listbox" className="topbar-search-results" role="listbox" aria-label="Client search results">
            {results.map((r) => (
              <div
                key={r.id}
                className="topbar-search-result"
                role="option"
                tabIndex={0}
                aria-selected={false}
                onClick={() => {
                  goToClient(r.id);
                  setSearch("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goToClient(r.id);
                    setSearch("");
                  }
                }}
              >
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <span style={{ color: "rgba(24,38,32,0.45)" }}>{r.segment}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-right">
        <div className="topbar-notif-wrap" ref={notifRef}>
          <button
            className="topbar-notif-btn"
            aria-label={`Notifications${notifOpen ? " (open)" : ""}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 15h12l-1.5-2.2V8.5a4.5 4.5 0 0 0-9 0v4.3L4 15Z" stroke="#182620" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8.2 17.2a1.9 1.9 0 0 0 3.6 0" stroke="#182620" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="topbar-notif-dot" aria-hidden="true" />
          </button>
          {notifOpen && (
            <div className="topbar-notif-panel" role="dialog" aria-label="Notifications panel">
              <div className="topbar-notif-heading">Notifications</div>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="topbar-notif-item">
                  <div className="topbar-notif-item-dot" style={{ background: n.dot }} aria-hidden="true" />
                  <div>
                    <div className="topbar-notif-item-title">{n.title}</div>
                    <div className="topbar-notif-item-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="topbar-divider" aria-hidden="true" />

        <div className="topbar-profile" aria-label={`Logged in as ${rm.name}`}>
          <div className="topbar-avatar" aria-hidden="true">{rm.initials}</div>
          <div>
            <div className="topbar-name">{rm.name}</div>
            <div className="topbar-role">{rm.title}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
