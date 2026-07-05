import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Client, Note, Transaction, CalendarEvent, Order, RmProfile, ModuleKey } from "../types";
import { clients, initialNotes, transactions, calendarEvents, initialOrders, underlyingOptions, rmProfile } from "../data/mockData";

interface AppState {
  clients: Client[];
  transactions: Transaction[];
  calendarEvents: CalendarEvent[];
  underlyingOptions: string[];
  rm: RmProfile;

  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;

  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

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
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeModule, setActiveModule] = useState<ModuleKey>("notes");
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const value = useMemo<AppState>(
    () => ({
      clients,
      transactions,
      calendarEvents,
      underlyingOptions,
      rm: rmProfile,
      notes,
      setNotes,
      orders,
      setOrders,
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
    }),
    [notes, orders, activeModule, selectedClientId, sidebarCollapsed]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
