import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { MONTH_NAMES, WEEKDAYS } from "../../theme";
import { fmtMoney, fmtDate } from "../../utils/format";
import "./CalendarModule.css";

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

interface Cell {
  date: string | null;
  dayNum: number | "";
  inMonth: boolean;
  hasInflow: boolean;
  hasOutflow: boolean;
  hasCorp: boolean;
  eventCount: number;
}

export default function CalendarModule() {
  const { calendarEvents } = useApp();
  const [month, setMonth] = useState("2026-07");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const cells = useMemo<Cell[]>(() => {
    const [y, m] = month.split("-").map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const daysInMonth = new Date(y, m, 0).getDate();
    const startOffset = firstDay.getDay();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const out: Cell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const dateStr = inMonth ? `${y}-${String(m).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}` : null;
      const dayEvents = inMonth ? calendarEvents.filter((ev) => ev.date === dateStr) : [];
      out.push({
        date: dateStr,
        dayNum: inMonth ? dayNum : "",
        inMonth,
        hasInflow: dayEvents.some((ev) => ev.type === "cashflow" && ev.subtype === "inflow"),
        hasOutflow: dayEvents.some((ev) => ev.type === "cashflow" && ev.subtype === "outflow"),
        hasCorp: dayEvents.some((ev) => ev.type === "corporate_action"),
        eventCount: dayEvents.length,
      });
    }
    return out;
  }, [month, calendarEvents]);

  const [cy, cm] = month.split("-").map(Number);
  const monthLabel = `${MONTH_NAMES[cm - 1]} ${cy}`;

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return calendarEvents
      .filter((ev) => ev.date === selectedDay)
      .map((ev) => {
        const isCorp = ev.type === "corporate_action";
        const tagLabel = isCorp ? ev.subtype : ev.subtype === "inflow" ? "Inflow" : "Outflow";
        const tagColor = isCorp ? "#8A6A2A" : ev.subtype === "inflow" ? "#1F5F4A" : "#B3453A";
        const amountLabel = !isCorp ? (ev.subtype === "outflow" ? "-" : "+") + fmtMoney(ev.amount, ev.currency) : null;
        return { ...ev, tagLabel, tagColor, amountLabel };
      });
  }, [selectedDay, calendarEvents]);

  return (
    <div className="cal-module">
      <div className="cal-grid-panel">
        <div className="cal-header">
          <div className="cal-month-label">{monthLabel}</div>
          <div className="cal-header-right">
            <div className="cal-legend">
              <span><span className="cal-legend-dot" style={{ background: "#2F8F5B" }} />Inflow</span>
              <span><span className="cal-legend-dot" style={{ background: "#B3453A" }} />Outflow</span>
              <span><span className="cal-legend-dot" style={{ background: "#C9A85C" }} />Corp. action</span>
            </div>
            <button className="cal-nav-btn" aria-label="Previous month" onClick={() => { setMonth((m) => shiftMonth(m, -1)); setSelectedDay(null); }}>‹</button>
            <button className="cal-nav-btn" aria-label="Next month" onClick={() => { setMonth((m) => shiftMonth(m, 1)); setSelectedDay(null); }}>›</button>
          </div>
        </div>

        <div className="cal-weekdays">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="cal-weekday">{wd}</div>
          ))}
        </div>

        <div className="cal-cells">
          {cells.map((cell, i) => {
            const isSelected = cell.date && cell.date === selectedDay;
            return (
              <div
                key={cell.date ?? `blank-${i}`}
                role={cell.inMonth ? "button" : undefined}
                tabIndex={cell.inMonth ? 0 : undefined}
                aria-label={cell.inMonth ? `${cell.dayNum} ${monthLabel}${cell.eventCount > 0 ? `, ${cell.eventCount} event${cell.eventCount === 1 ? "" : "s"}` : ""}` : undefined}
                aria-pressed={isSelected ? true : undefined}
                className="cal-cell"
                style={{
                  background: isSelected ? "#EAF4EE" : "#fff",
                  border: `1.5px solid ${isSelected ? "#1F5F4A" : "rgba(20,30,25,0.07)"}`,
                  opacity: cell.inMonth ? 1 : 0.35,
                  cursor: cell.inMonth ? "pointer" : "default",
                }}
                onClick={() => cell.date && setSelectedDay(cell.date)}
                onKeyDown={(e) => { if (cell.date && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setSelectedDay(cell.date); } }}
              >
                <div className="cal-cell-day">{cell.dayNum}</div>
                <div className="cal-cell-dots">
                  {cell.hasInflow && <div className="cal-dot" style={{ background: "#2F8F5B" }} />}
                  {cell.hasOutflow && <div className="cal-dot" style={{ background: "#B3453A" }} />}
                  {cell.hasCorp && <div className="cal-dot" style={{ background: "#C9A85C" }} />}
                </div>
                {cell.eventCount > 0 && <div className="cal-cell-count">{cell.eventCount} event(s)</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="cal-side-panel">
        {selectedDay ? (
          <>
            <div className="cal-side-title">{fmtDate(selectedDay)}</div>
            {selectedDayEvents.length > 0 ? (
              <div className="cal-events-list">
                {selectedDayEvents.map((ev) => (
                  <div key={ev.id} className="cal-event-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#182620" }}>{ev.clientName}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ev.tagColor }}>{ev.tagLabel}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(24,38,32,0.6)", marginTop: 4 }}>{ev.product}</div>
                    {ev.amountLabel && <div style={{ fontSize: 13, fontWeight: 700, marginTop: 5, color: ev.tagColor }}>{ev.amountLabel}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="cal-empty">No events on this day.</div>
            )}
          </>
        ) : (
          <div className="cal-empty">Select a day to see cash flow events and corporate actions relevant to your clients' holdings.</div>
        )}
      </div>
    </div>
  );
}
