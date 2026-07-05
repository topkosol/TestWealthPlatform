import { useApp } from "../context/AppContext";
import { ACCENT } from "../theme";
import type { ModuleKey } from "../types";
import "./Sidebar.css";

const NAV_ITEMS: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "notes",
    label: "My Notes",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="2.5" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="10.3" x2="14" y2="10.3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="13.6" x2="11" y2="13.6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "client360",
    label: "Client 360",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 17c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "calendar",
    label: "Calendar",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="4" width="15" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2.5" y1="8" x2="17.5" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="2.3" x2="6" y2="5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="2.3" x2="14" y2="5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "structured",
    label: "Structured Note Order",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <line x1="4.5" y1="16" x2="4.5" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10" y1="16" x2="10" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="15.5" y1="16" x2="15.5" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "transactions",
    label: "Historical Transactions",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="6" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="10" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "portfolioPreference",
    label: "Portfolio Preference",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <path d="M10 2.8A7.2 7.2 0 1 0 17.2 10H10V2.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12.8 2.95A7.2 7.2 0 0 1 17.05 7.2H12.8V2.95Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar } = useApp();

  return (
    <div className="sidebar" style={{ width: sidebarCollapsed ? 76 : 232 }}>
      <div className="sidebar-header">
        <div className="sidebar-logo" style={{ background: ACCENT }}>A</div>
        {!sidebarCollapsed && <div className="sidebar-title">Ardent Private</div>}
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active = activeModule === item.key;
          return (
            <div
              key={item.key}
              role="button"
              tabIndex={0}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className="sidebar-nav-item"
              style={{ background: active ? ACCENT : "transparent", color: active ? "#fff" : "rgba(236,243,238,0.68)" }}
              onClick={() => setActiveModule(item.key)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveModule(item.key); } }}
            >
              <span className="sidebar-nav-icon" aria-hidden="true">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
            </div>
          );
        })}
      </nav>

      <div
        className="sidebar-collapse"
        role="button"
        tabIndex={0}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggleSidebar}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSidebar(); } }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)", flex: "none" }}>
          <path d="M12.5 4L7 10l5.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {!sidebarCollapsed && <span className="sidebar-collapse-label">Collapse</span>}
      </div>
    </div>
  );
}
