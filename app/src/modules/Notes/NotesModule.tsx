import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import { ACCENT, PRIORITY_META } from "../../theme";
import { fmtDate } from "../../utils/format";
import type { Priority } from "../../types";
import "./NotesModule.css";

type NoteFilter = "All" | Priority;
type NoteSort = "dueDate" | "priority";

const PRIORITY_RANK: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export default function NotesModule() {
  const { notes, setNotes, clients } = useApp();
  const [filter, setFilter] = useState<NoteFilter>("All");
  const [sort, setSort] = useState<NoteSort>("dueDate");
  const [showNew, setShowNew] = useState(false);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [due, setDue] = useState("");
  const [linkedClient, setLinkedClient] = useState("");

  const openCount = notes.filter((n) => !n.done).length;
  const doneCount = notes.filter((n) => n.done).length;

  const visibleNotes = useMemo(() => {
    let list = notes.filter((n) => filter === "All" || n.priority === filter);
    list = [...list].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (sort === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return a.dueDate < b.dueDate ? -1 : 1;
    });
    return list;
  }, [notes, filter, sort]);

  function resetForm() {
    setShowNew(false);
    setText("");
    setPriority("Medium");
    setDue("");
    setLinkedClient("");
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setNotes((prev) => [
      {
        id: "N-" + Date.now(),
        text: trimmed,
        priority,
        dueDate: due || new Date().toISOString().slice(0, 10),
        done: false,
        clientId: linkedClient || null,
      },
      ...prev,
    ]);
    resetForm();
  }

  function toggleDone(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
  }

  const filterChip = (key: NoteFilter, label: string, activeBg: string) => {
    const active = filter === key;
    return (
      <div
        key={key}
        role="radio"
        aria-checked={active}
        tabIndex={0}
        className="notes-chip"
        style={{ background: active ? activeBg : "#F0F1EF", color: active ? "#fff" : "#182620" }}
        onClick={() => setFilter(key)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFilter(key); } }}
      >
        {label}
      </div>
    );
  };

  const sortChip = (key: NoteSort, label: string) => {
    const active = sort === key;
    return (
      <div
        key={key}
        role="radio"
        aria-checked={active}
        tabIndex={0}
        className="notes-chip"
        style={{ background: active ? "#182620" : "#F0F1EF", color: active ? "#fff" : "#182620" }}
        onClick={() => setSort(key)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSort(key); } }}
      >
        {label}
      </div>
    );
  };

  return (
    <div className="notes-module">
      <div className="notes-header">
        <div>
          <div className="notes-title">My Notes</div>
          <div className="notes-subtitle">{openCount} open · {doneCount} completed</div>
        </div>
        <button className="notes-new-btn" style={{ background: ACCENT }} onClick={() => setShowNew(true)}>
          + New Note
        </button>
      </div>

      {showNew && (
        <div className="notes-new-card">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to happen?"
            className="notes-new-textarea"
            aria-label="Note text"
          />
          <div className="notes-new-controls">
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="notes-new-select" aria-label="Priority">
              <option value="High">High priority</option>
              <option value="Medium">Medium priority</option>
              <option value="Low">Low priority</option>
            </select>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="notes-new-select" aria-label="Due date" />
            <select value={linkedClient} onChange={(e) => setLinkedClient(e.target.value)} className="notes-new-select" style={{ minWidth: 180 }} aria-label="Link to client (optional)">
              <option value="">Link to client (optional)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div style={{ flex: 1 }} />
            <button className="notes-new-cancel" onClick={resetForm}>Cancel</button>
            <button className="notes-new-save" style={{ background: ACCENT }} onClick={submit}>Save note</button>
          </div>
        </div>
      )}

      <div className="notes-filters">
        {filterChip("All", "All", "#182620")}
        {filterChip("High", "High", "#B3453A")}
        {filterChip("Medium", "Medium", "#C9A85C")}
        {filterChip("Low", "Low", "#1F5F4A")}
        <div style={{ flex: 1 }} />
        {sortChip("dueDate", "Sort: Due date")}
        {sortChip("priority", "Sort: Priority")}
      </div>

      <div className="notes-list">
        {visibleNotes.map((note) => {
          const meta = PRIORITY_META[note.priority];
          const client = note.clientId ? clients.find((c) => c.id === note.clientId) : null;
          return (
            <div key={note.id} className="notes-item">
              <div
                role="checkbox"
                aria-checked={note.done}
                aria-label={note.done ? "Mark as open" : "Mark as done"}
                tabIndex={0}
                className="notes-checkbox"
                style={{ borderColor: note.done ? ACCENT : "rgba(20,30,25,0.25)", background: note.done ? ACCENT : "transparent" }}
                onClick={() => toggleDone(note.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDone(note.id); } }}
              >
                {note.done && (
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 10.5l4 4L16 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="notes-item-text"
                  style={{ textDecoration: note.done ? "line-through" : "none", opacity: note.done ? 0.5 : 1 }}
                >
                  {note.text}
                </div>
                <div className="notes-item-meta">
                  <span className="notes-priority-tag" style={{ background: meta.bg, color: meta.fg }}>{note.priority}</span>
                  <span className="notes-due">Due {fmtDate(note.dueDate)}</span>
                  {client && <span className="notes-client-tag">{client.name}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
