export type Segment = "Private" | "Premier";
export type RiskProfile = "Conservative" | "Balanced" | "Growth" | "Aggressive";
export type KycStatus = "Verified" | "Pending Review" | "Expired";
export type Currency = "USD" | "EUR" | "CHF" | "GBP" | "SGD";
export type AssetClass = "Equities" | "Fixed Income" | "Structured Products" | "Funds" | "Cash";

export interface Holding {
  product: string;
  assetClass: AssetClass;
  quantity: number;
  value: number;
  currency: Currency;
  ytdReturn: number;
}

export interface AumBreakdown {
  equities: number;
  fixedIncome: number;
  structuredProducts: number;
  funds: number;
  cash: number;
}

export interface Contact {
  email: string;
  phone: string;
  address: string;
  dob: string;
  nationality: string;
}

export interface AccountDetails {
  accountNumber: string;
  accountType: string;
  baseCurrency: Currency;
  openDate: string;
  custodian: string;
}

export interface Client {
  id: string;
  name: string;
  segment: Segment;
  rm: string;
  riskProfile: RiskProfile;
  kycStatus: KycStatus;
  totalAUM: number;
  aumBreakdown: AumBreakdown;
  aumTrend: number[];
  holdings: Holding[];
  contact: Contact;
  accountDetails: AccountDetails;
}

export type Priority = "High" | "Medium" | "Low";

export interface Note {
  id: string;
  text: string;
  priority: Priority;
  dueDate: string;
  done: boolean;
  clientId: string | null;
}

export type ProductType = "Structured Note" | "Equity" | "Fixed Income" | "Fund" | "FX";
export type TxStatus = "Settled" | "Pending" | "Failed";

export interface Transaction {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  productType: ProductType;
  productName: string;
  action: string;
  amount: number;
  currency: Currency;
  status: TxStatus;
}

export interface CashflowEvent {
  id: string;
  date: string;
  type: "cashflow";
  subtype: "inflow" | "outflow";
  clientId: string;
  clientName: string;
  product: string;
  amount: number;
  currency: Currency;
}

export interface CorporateActionEvent {
  id: string;
  date: string;
  type: "corporate_action";
  subtype: string;
  clientId: string;
  clientName: string;
  product: string;
  description: string;
}

export type CalendarEvent = CashflowEvent | CorporateActionEvent;

export type OrderStatus = "Pending" | "Quoted" | "Booked" | "Rejected";

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  underlyings: string[];
  tenor: string;
  barrier: number;
  couponType: string;
  notional: number;
  currency: Currency;
  status: OrderStatus;
  quote: { indicativeCoupon: number; indicativePrice: number } | null;
  createdDate: string;
}

export interface RmProfile {
  name: string;
  title: string;
  initials: string;
  desk: string;
}

export type ModuleKey = "notes" | "client360" | "calendar" | "structured" | "transactions" | "portfolioPreference";
