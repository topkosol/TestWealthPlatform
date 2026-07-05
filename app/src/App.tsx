import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import NotesModule from "./modules/Notes/NotesModule";
import Client360Module from "./modules/Client360/Client360Module";
import CalendarModule from "./modules/Calendar/CalendarModule";
import StructuredOrderModule from "./modules/StructuredOrder/StructuredOrderModule";
import TransactionsModule from "./modules/Transactions/TransactionsModule";
import PortfolioPreferenceModule from "./modules/PortfolioPreference/PortfolioPreferenceModule";
import "./App.css";

function Content() {
  const { activeModule } = useApp();
  switch (activeModule) {
    case "notes":
      return <NotesModule />;
    case "client360":
      return <Client360Module />;
    case "calendar":
      return <CalendarModule />;
    case "structured":
      return <StructuredOrderModule />;
    case "transactions":
      return <TransactionsModule />;
    case "portfolioPreference":
      return <PortfolioPreferenceModule />;
    default:
      return null;
  }
}

function Shell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="app-content">
          <Content />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
