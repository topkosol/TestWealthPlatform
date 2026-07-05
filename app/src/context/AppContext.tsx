import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Client, Note, Transaction, CalendarEvent, Order, RmProfile, ModuleKey, ModelPortfolios, Priority } from "../types";
import { getClients } from "../api/clients";
import { getTransactions } from "../api/transactions";
import { getCalendarEvents } from "../api/calendarEvents";
import { getNotes, createNote, toggleNote as toggleNoteApi } from "../api/notes";
import { getOrders, requestQuote as requestQuoteApi, bookOrder as bookOrderApi } from "../api/orders";
import { getRmProfile, getUnderlyings, getModelPortfolios } from "../api/reference";
import type { QuoteRequestInput, QuoteResult, BookOrderInput } from "../api/orders";

interface AppState {
  clients: Client[];
  transactions: Transaction[];
  calendarEvents: CalendarEvent[];
  underlyingOptions: string[];
  rm: RmProfile;
  modelPortfolios: ModelPortfolios;

  loading: boolean;
  error: string | null;

  notes: Note[];
  addNote: (input: { text: string; priority: Priority; dueDate: string; clientId: string | null }) => Promise<void>;
  toggleNote: (id: string) => Promise<void>;

  orders: Order[];
  requestQuote: (input: QuoteRequestInput) => Promise<QuoteResult>;
  bookOrder: (input: BookOrderInput) => Promise<Order>;

  activeModule: ModuleKey;
  setActiveModule: (m: ModuleKey) => void;

  selectedClientId: string;
  setSelectedClientId: (id: string) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  goToClient: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [underlyingOptions, setUnderlyingOptions] = useState<string[]>([]);
  const [rm, setRm] = useState<RmProfile | null>(null);
  const [modelPortfolios, setModelPortfolios] = useState<ModelPortfolios | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [activeModule, setActiveModule] = useState<ModuleKey>("notes");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [
          clientsRes,
          transactionsRes,
          calendarEventsRes,
          underlyingOptionsRes,
          rmRes,
          notesRes,
          ordersRes,
          modelPortfoliosRes,
        ] = await Promise.all([
          getClients(),
          getTransactions(),
          getCalendarEvents(),
          getUnderlyings(),
          getRmProfile(),
          getNotes(),
          getOrders(),
          getModelPortfolios(),
        ]);
        if (cancelled) return;
        setClients(clientsRes);
        setTransactions(transactionsRes);
        setCalendarEvents(calendarEventsRes);
        setUnderlyingOptions(underlyingOptionsRes);
        setRm(rmRes);
        setNotes(notesRes);
        setOrders(ordersRes);
        setModelPortfolios(modelPortfoliosRes);
        setSelectedClientId(clientsRes[0]?.id ?? "");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppState | null>(() => {
    if (!rm || !modelPortfolios) return null;
    return {
      clients,
      transactions,
      calendarEvents,
      underlyingOptions,
      rm,
      modelPortfolios,
      loading,
      error,
      notes,
      addNote: async (input) => {
        const created = await createNote({ ...input });
        setNotes((prev) => [created, ...prev]);
      },
      toggleNote: async (id) => {
        const updated = await toggleNoteApi(id);
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      },
      orders,
      requestQuote: (input) => requestQuoteApi(input),
      bookOrder: async (input) => {
        const created = await bookOrderApi(input);
        setOrders((prev) => [created, ...prev]);
        return created;
      },
      activeModule,
      setActiveModule,
      selectedClientId,
      setSelectedClientId,
      sidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((v) => !v),
      goToClient: (id: string) => {
        setSelectedClientId(id);
        setActiveModule("client360");
      },
    };
  }, [
    clients,
    transactions,
    calendarEvents,
    underlyingOptions,
    rm,
    modelPortfolios,
    loading,
    error,
    notes,
    orders,
    activeModule,
    selectedClientId,
    sidebarCollapsed,
  ]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 15, color: "#182620" }}>
        Loading…
      </div>
    );
  }

  if (error || !value) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 15, color: "#B3453A" }}>
        Failed to load: {error ?? "Unknown error"}
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
