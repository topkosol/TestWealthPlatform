import type {
  Client,
  Note,
  Transaction,
  CalendarEvent,
  Order,
  RmProfile,
  Currency,
  Segment,
  RiskProfile,
  KycStatus,
  Holding,
  AumBreakdown,
} from "../types";

// Deterministic mock data for the Wealth Management Platform.
// Same seeded PRNG as the design prototype so the data set is stable across reloads.
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260705);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, dp = 2) => +(rand() * (max - min) + min).toFixed(dp);

const FIRST_NAMES = ["Alexandra", "Marcus", "Sofia", "James", "Elena", "David", "Priya", "Thomas", "Isabelle", "Wei", "Rachel", "Nikolai", "Amara", "Julian", "Charlotte", "Hassan", "Olivia", "Kenji", "Fatima", "Benedikt"];
const LAST_NAMES = ["Whitfield", "Chen", "Almeida", "Sinclair", "Volkov", "Reinholt", "Kapoor", "Marchetti", "Dubois", "Tanaka", "Okonkwo", "Larsson", "Haddad", "Bergström", "Costa", "Kowalski", "Nakamura", "Fitzgerald", "Moreau", "Aldana"];

const clientNames = Array.from({ length: 18 }, (_, i) => `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`);

const RM_NAME = "Charlotte Reyes";
const SEGMENTS: Segment[] = ["Private", "Premier"];
const RISK_PROFILES: RiskProfile[] = ["Conservative", "Balanced", "Growth", "Aggressive"];
const CURRENCIES: Currency[] = ["USD", "EUR", "CHF", "GBP", "SGD"];
const NATIONALITIES = ["US", "UK", "Switzerland", "Singapore", "France", "Germany", "UAE", "Hong Kong", "Canada", "Japan"];
const CUSTODIANS = ["Pictet & Cie", "UBS Custody", "Julius Baer Nominees", "Northern Trust", "State Street"];

function genMonthlyTrend(base: number): number[] {
  let v = base * 0.86;
  const out: number[] = [];
  for (let i = 0; i < 12; i++) {
    v = v * (1 + randFloat(-0.035, 0.05, 4));
    out.push(Math.round(v));
  }
  out[11] = base;
  return out;
}

const EQUITY_HOLDINGS = ["Apple Inc.", "Nestlé SA", "Microsoft Corp.", "LVMH", "ASML Holding", "Novo Nordisk", "Taiwan Semiconductor", "Roche Holding", "Alphabet Inc.", "Shell plc"];
const BOND_HOLDINGS = ["US Treasury 4.25% 2033", "Swiss Confed 1.5% 2030", "Germany Bund 2.4% 2031", "UK Gilt 3.75% 2029", "France OAT 2.5% 2032"];
const FUND_HOLDINGS = ["Global Equity Growth Fund", "Emerging Markets Opportunities", "Sustainable Balanced Fund", "Absolute Return Multi-Strategy", "Asia Pacific Income Fund"];
const STRUCTURED_HOLDINGS = ["Autocall on EuroStoxx50 6.2%", "Reverse Convertible on Nestlé 7.1%", "Barrier Note on S&P500 5.8%", "Twin-Win on Gold 4.9%"];

function genHoldings(assetClassTotals: AumBreakdown): Holding[] {
  const holdings: Holding[] = [];
  const addFrom = (list: string[], assetClass: Holding["assetClass"], total: number, count: number) => {
    let remaining = total;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const val = isLast ? remaining : Math.round(total * randFloat(0.15, 0.45));
      remaining -= val;
      if (val <= 0) continue;
      holdings.push({
        product: pick(list),
        assetClass,
        quantity: randInt(50, 5000),
        value: val,
        currency: pick(CURRENCIES),
        ytdReturn: randFloat(-8, 18, 1),
      });
    }
  };
  addFrom(EQUITY_HOLDINGS, "Equities", assetClassTotals.equities, randInt(2, 4));
  addFrom(BOND_HOLDINGS, "Fixed Income", assetClassTotals.fixedIncome, randInt(1, 3));
  addFrom(STRUCTURED_HOLDINGS, "Structured Products", assetClassTotals.structuredProducts, randInt(1, 2));
  addFrom(FUND_HOLDINGS, "Funds", assetClassTotals.funds, randInt(1, 3));
  if (assetClassTotals.cash > 0) {
    holdings.push({ product: "Cash & Equivalents", assetClass: "Cash", quantity: 1, value: assetClassTotals.cash, currency: "USD", ytdReturn: 4.1 });
  }
  return holdings;
}

export const clients: Client[] = clientNames.map((name, i) => {
  const totalAUM = randInt(2_200_000, 48_000_000);
  const wEq = randFloat(0.22, 0.42);
  const wFi = randFloat(0.15, 0.3);
  const wSp = randFloat(0.05, 0.18);
  const wFu = randFloat(0.1, 0.22);
  const wCash = Math.max(0.04, 1 - wEq - wFi - wSp - wFu);
  const wSum = wEq + wFi + wSp + wFu + wCash;
  const aumBreakdown: AumBreakdown = {
    equities: Math.round((wEq / wSum) * totalAUM),
    fixedIncome: Math.round((wFi / wSum) * totalAUM),
    structuredProducts: Math.round((wSp / wSum) * totalAUM),
    funds: Math.round((wFu / wSum) * totalAUM),
    cash: Math.round((wCash / wSum) * totalAUM),
  };
  const id = `CL-${1000 + i}`;
  const kycStatus: KycStatus = i % 7 === 0 ? "Pending Review" : i % 11 === 0 ? "Expired" : "Verified";
  return {
    id,
    name,
    segment: totalAUM > 15_000_000 ? "Private" : pick(SEGMENTS),
    rm: RM_NAME,
    riskProfile: pick(RISK_PROFILES),
    kycStatus,
    totalAUM,
    aumBreakdown,
    aumTrend: genMonthlyTrend(totalAUM),
    holdings: genHoldings(aumBreakdown),
    contact: {
      email: `${name.toLowerCase().replace(/ /g, ".")}@mailbox.com`,
      phone: `+1 ${randInt(200, 999)}-${randInt(200, 999)}-${randInt(1000, 9999)}`,
      address: `${randInt(1, 200)} ${pick(["Park Ave", "Bahnhofstrasse", "Avenue Montaigne", "Orchard Rd", "Mayfair Sq"])}, ${pick(["New York", "Zurich", "Paris", "Singapore", "London"])}`,
      dob: `19${randInt(45, 82)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
      nationality: pick(NATIONALITIES),
    },
    accountDetails: {
      accountNumber: `AC-${randInt(100000, 999999)}`,
      accountType: pick(["Discretionary", "Advisory", "Execution-Only"]),
      baseCurrency: pick(CURRENCIES),
      openDate: `20${randInt(10, 23)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
      custodian: pick(CUSTODIANS),
    },
  };
});

// ---- Notes ----
export const initialNotes: Note[] = [
  { id: "N-1", text: "Follow up with Alexandra Whitfield on structured note maturity proceeds reinvestment", priority: "High", dueDate: "2026-07-08", done: false, clientId: "CL-1000" },
  { id: "N-2", text: "Prepare Q2 portfolio review deck for Marcus Chen", priority: "High", dueDate: "2026-07-07", done: false, clientId: "CL-1001" },
  { id: "N-3", text: "Chase KYC renewal documents — expired accounts", priority: "High", dueDate: "2026-07-10", done: false, clientId: null },
  { id: "N-4", text: "Call Sofia Almeida re: risk profile update after recent conversation", priority: "Medium", dueDate: "2026-07-14", done: false, clientId: "CL-1002" },
  { id: "N-5", text: "Send indicative pricing for autocall idea to James Sinclair", priority: "Medium", dueDate: "2026-07-12", done: false, clientId: "CL-1003" },
  { id: "N-6", text: "Review onboarding checklist for prospective client referral", priority: "Low", dueDate: "2026-07-20", done: false, clientId: null },
  { id: "N-7", text: "Book travel for Zurich client visit week", priority: "Low", dueDate: "2026-07-25", done: false, clientId: null },
  { id: "N-8", text: "Confirm dividend reinvestment instructions with Elena Volkov", priority: "Medium", dueDate: "2026-07-09", done: true, clientId: "CL-1004" },
  { id: "N-9", text: "Reconcile cash sweep discrepancy flagged by ops", priority: "High", dueDate: "2026-07-06", done: true, clientId: null },
  { id: "N-10", text: "Draft year-end tax pack outline for Private segment clients", priority: "Low", dueDate: "2026-08-01", done: false, clientId: null },
];

// ---- Transactions ----
const PRODUCT_TYPES: Transaction["productType"][] = ["Structured Note", "Equity", "Fixed Income", "Fund", "FX"];
const ACTIONS_BY_TYPE: Record<Transaction["productType"], string[]> = {
  "Structured Note": ["Subscribe", "Redeem"],
  Equity: ["Buy", "Sell"],
  "Fixed Income": ["Buy", "Sell"],
  Fund: ["Subscribe", "Redeem"],
  FX: ["Buy", "Sell"],
};
const PRODUCTS_BY_TYPE: Record<Transaction["productType"], string[]> = {
  "Structured Note": STRUCTURED_HOLDINGS,
  Equity: EQUITY_HOLDINGS,
  "Fixed Income": BOND_HOLDINGS,
  Fund: FUND_HOLDINGS,
  FX: ["EUR/USD Spot", "USD/CHF Spot", "GBP/USD Forward", "USD/SGD Spot"],
};

export const transactions: Transaction[] = Array.from({ length: 132 }, (_, i) => {
  const client = pick(clients);
  const productType = pick(PRODUCT_TYPES);
  const action = pick(ACTIONS_BY_TYPE[productType]);
  const day = randInt(1, 28);
  const month = randInt(1, 7);
  const status: Transaction["status"] = rand() < 0.82 ? "Settled" : rand() < 0.6 ? "Pending" : "Failed";
  return {
    id: `TX-${20260 + i}`,
    date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    clientId: client.id,
    clientName: client.name,
    productType,
    productName: pick(PRODUCTS_BY_TYPE[productType]),
    action,
    amount: randInt(15000, 3200000),
    currency: pick(CURRENCIES),
    status,
  };
}).sort((a, b) => (a.date < b.date ? 1 : -1));

// ---- Calendar events ----
const CORP_ACTION_TYPES = ["Stock Split", "Dividend Payment", "Merger", "Rights Issue", "Coupon Payment"];
function buildCalendarEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  let id = 1;
  for (let month = 6; month <= 7; month++) {
    for (let d = 1; d <= 28; d++) {
      if (rand() < 0.32) {
        const client = pick(clients);
        const isInflow = rand() < 0.55;
        events.push({
          id: `EV-${id++}`,
          date: `2026-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
          type: "cashflow",
          subtype: isInflow ? "inflow" : "outflow",
          clientId: client.id,
          clientName: client.name,
          product: isInflow ? pick(["Coupon Payment", "Dividend", "Note Maturity", "Interest Payment"]) : pick(["Subscription", "Management Fee", "Custody Fee"]),
          amount: randInt(2000, 480000),
          currency: pick(CURRENCIES),
        });
      }
      if (rand() < 0.14) {
        const client = pick(clients);
        const holding = pick(client.holdings);
        events.push({
          id: `EV-${id++}`,
          date: `2026-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
          type: "corporate_action",
          subtype: pick(CORP_ACTION_TYPES),
          clientId: client.id,
          clientName: client.name,
          product: holding ? holding.product : "N/A",
          description: `${pick(CORP_ACTION_TYPES)} affecting holding position`,
        });
      }
    }
  }
  return events;
}
export const calendarEvents: CalendarEvent[] = buildCalendarEvents();

// ---- Structured note orders ----
export const initialOrders: Order[] = [
  { id: "ORD-501", clientId: "CL-1000", clientName: clients[0].name, underlyings: ["Apple Inc.", "Microsoft Corp."], tenor: "3Y", barrier: 65, couponType: "Autocall Memory", notional: 500000, currency: "USD", status: "Booked", quote: { indicativeCoupon: 8.4, indicativePrice: 100.2 }, createdDate: "2026-06-18" },
  { id: "ORD-502", clientId: "CL-1003", clientName: clients[3].name, underlyings: ["Nestlé SA"], tenor: "2Y", barrier: 70, couponType: "Reverse Convertible", notional: 250000, currency: "CHF", status: "Quoted", quote: { indicativeCoupon: 6.9, indicativePrice: 99.8 }, createdDate: "2026-06-27" },
  { id: "ORD-503", clientId: "CL-1006", clientName: clients[6].name, underlyings: ["EuroStoxx 50"], tenor: "5Y", barrier: 60, couponType: "Autocall Memory", notional: 1000000, currency: "EUR", status: "Pending", quote: null, createdDate: "2026-07-01" },
  { id: "ORD-504", clientId: "CL-1011", clientName: clients[11].name, underlyings: ["Gold Spot"], tenor: "3Y", barrier: 75, couponType: "Twin-Win", notional: 350000, currency: "USD", status: "Rejected", quote: { indicativeCoupon: 5.1, indicativePrice: 98.4 }, createdDate: "2026-06-10" },
];

export const underlyingOptions: string[] = ["Apple Inc.", "Microsoft Corp.", "Nestlé SA", "LVMH", "ASML Holding", "EuroStoxx 50", "S&P 500", "Gold Spot", "Novo Nordisk", "Taiwan Semiconductor"];

export const rmProfile: RmProfile = { name: RM_NAME, title: "Senior Relationship Manager", initials: "CR", desk: "Private Banking — EMEA" };
