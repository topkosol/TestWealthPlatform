// Package mockdata is a Go port of the frontend's src/data/mockData.ts.
// It generates the same deterministic (seeded) demo data set that used to
// live in the React app, so that the backend can now be the single source
// of truth for it. The generator is invoked once at process startup and
// its output is used to seed the in-memory repositories.
package mockdata

import (
	"fmt"
	"math"
	"sort"

	"wealthplatform-backend/internal/domain"
)

// Seed matches the seed used previously in the frontend prototype.
const Seed uint32 = 20260705

const rmName = "Charlotte Reyes"

var firstNames = []string{"Alexandra", "Marcus", "Sofia", "James", "Elena", "David", "Priya", "Thomas", "Isabelle", "Wei", "Rachel", "Nikolai", "Amara", "Julian", "Charlotte", "Hassan", "Olivia", "Kenji", "Fatima", "Benedikt"}
var lastNames = []string{"Whitfield", "Chen", "Almeida", "Sinclair", "Volkov", "Reinholt", "Kapoor", "Marchetti", "Dubois", "Tanaka", "Okonkwo", "Larsson", "Haddad", "Bergström", "Costa", "Kowalski", "Nakamura", "Fitzgerald", "Moreau", "Aldana"}

var segments = []string{"Private", "Premier"}
var riskProfiles = []string{"Conservative", "Balanced", "Growth", "Aggressive"}
var currencies = []string{"USD", "EUR", "CHF", "GBP", "SGD"}
var nationalities = []string{"US", "UK", "Switzerland", "Singapore", "France", "Germany", "UAE", "Hong Kong", "Canada", "Japan"}
var custodians = []string{"Pictet & Cie", "UBS Custody", "Julius Baer Nominees", "Northern Trust", "State Street"}

var equityHoldings = []string{"Apple Inc.", "Nestlé SA", "Microsoft Corp.", "LVMH", "ASML Holding", "Novo Nordisk", "Taiwan Semiconductor", "Roche Holding", "Alphabet Inc.", "Shell plc"}
var bondHoldings = []string{"US Treasury 4.25% 2033", "Swiss Confed 1.5% 2030", "Germany Bund 2.4% 2031", "UK Gilt 3.75% 2029", "France OAT 2.5% 2032"}
var fundHoldings = []string{"Global Equity Growth Fund", "Emerging Markets Opportunities", "Sustainable Balanced Fund", "Absolute Return Multi-Strategy", "Asia Pacific Income Fund"}
var structuredHoldings = []string{"Autocall on EuroStoxx50 6.2%", "Reverse Convertible on Nestlé 7.1%", "Barrier Note on S&P500 5.8%", "Twin-Win on Gold 4.9%"}

var productTypes = []string{"Structured Note", "Equity", "Fixed Income", "Fund", "FX"}
var actionsByType = map[string][]string{
	"Structured Note": {"Subscribe", "Redeem"},
	"Equity":          {"Buy", "Sell"},
	"Fixed Income":    {"Buy", "Sell"},
	"Fund":            {"Subscribe", "Redeem"},
	"FX":              {"Buy", "Sell"},
}
var productsByType = map[string][]string{
	"Structured Note": structuredHoldings,
	"Equity":          equityHoldings,
	"Fixed Income":    bondHoldings,
	"Fund":            fundHoldings,
	"FX":              {"EUR/USD Spot", "USD/CHF Spot", "GBP/USD Forward", "USD/SGD Spot"},
}

var corpActionTypes = []string{"Stock Split", "Dividend Payment", "Merger", "Rights Issue", "Coupon Payment"}

var underlyingOptions = []string{"Apple Inc.", "Microsoft Corp.", "Nestlé SA", "LVMH", "ASML Holding", "EuroStoxx 50", "S&P 500", "Gold Spot", "Novo Nordisk", "Taiwan Semiconductor"}

// ModelPortfolios are the house target allocation weights (%) per risk
// preference, ported verbatim from modelPortfolios.ts.
var ModelPortfolios = map[string]domain.AumBreakdown{
	"Conservative": {Equities: 15, FixedIncome: 45, StructuredProducts: 5, Funds: 20, Cash: 15},
	"Balanced":     {Equities: 30, FixedIncome: 30, StructuredProducts: 10, Funds: 22, Cash: 8},
	"Growth":       {Equities: 45, FixedIncome: 15, StructuredProducts: 15, Funds: 20, Cash: 5},
	"Aggressive":   {Equities: 55, FixedIncome: 8, StructuredProducts: 20, Funds: 14, Cash: 3},
}

// Dataset bundles every generated collection returned by Generate.
type Dataset struct {
	Clients         []domain.Client
	Notes           []domain.Note
	Transactions    []domain.Transaction
	CalendarEvents  []domain.CalendarEvent
	Orders          []domain.Order
	Underlyings     []string
	RmProfile       domain.RmProfile
	ModelPortfolios map[string]domain.AumBreakdown
}

func strPtr(s string) *string { return &s }

func padLeft2(n int) string {
	return fmt.Sprintf("%02d", n)
}

func genMonthlyTrend(r *Rng, base float64) []int {
	v := base * 0.86
	out := make([]int, 0, 12)
	for i := 0; i < 12; i++ {
		v = v * (1 + r.RandFloat(-0.035, 0.05, 4))
		out = append(out, int(math.Round(v)))
	}
	out[11] = int(math.Round(base))
	return out
}

func genHoldings(r *Rng, totals domain.AumBreakdown) []domain.Holding {
	holdings := make([]domain.Holding, 0)
	addFrom := func(list []string, assetClass string, total float64, count int) {
		remaining := total
		for i := 0; i < count; i++ {
			isLast := i == count-1
			var val float64
			if isLast {
				val = remaining
			} else {
				val = math.Round(total * r.RandFloat(0.15, 0.45, 2))
			}
			remaining -= val
			if val <= 0 {
				continue
			}
			holdings = append(holdings, domain.Holding{
				Product:    Pick(r, list),
				AssetClass: assetClass,
				Quantity:   r.RandInt(50, 5000),
				Value:      int(val),
				Currency:   Pick(r, currencies),
				YtdReturn:  r.RandFloat(-8, 18, 1),
			})
		}
	}
	addFrom(equityHoldings, "Equities", totals.Equities, r.RandInt(2, 4))
	addFrom(bondHoldings, "Fixed Income", totals.FixedIncome, r.RandInt(1, 3))
	addFrom(structuredHoldings, "Structured Products", totals.StructuredProducts, r.RandInt(1, 2))
	addFrom(fundHoldings, "Funds", totals.Funds, r.RandInt(1, 3))
	if totals.Cash > 0 {
		holdings = append(holdings, domain.Holding{
			Product:    "Cash & Equivalents",
			AssetClass: "Cash",
			Quantity:   1,
			Value:      int(totals.Cash),
			Currency:   "USD",
			YtdReturn:  4.1,
		})
	}
	return holdings
}

// Generate produces the full deterministic demo data set using the given
// seed, mirroring the generation order of the original mockData.ts so the
// resulting shapes/ranges match what the frontend used to produce itself.
func Generate(seed uint32) Dataset {
	r := NewRng(seed)

	n := len(firstNames)
	clientNames := make([]string, n)
	for i := 0; i < n; i++ {
		clientNames[i] = firstNames[i] + " " + lastNames[i]
	}

	clients := make([]domain.Client, 0, n)
	for i, name := range clientNames {
		totalAUM := r.RandInt(2_200_000, 48_000_000)
		wEq := r.RandFloat(0.22, 0.42, 2)
		wFi := r.RandFloat(0.15, 0.3, 2)
		wSp := r.RandFloat(0.05, 0.18, 2)
		wFu := r.RandFloat(0.1, 0.22, 2)
		wCash := math.Max(0.04, 1-wEq-wFi-wSp-wFu)
		wSum := wEq + wFi + wSp + wFu + wCash

		aumBreakdown := domain.AumBreakdown{
			Equities:           math.Round((wEq / wSum) * float64(totalAUM)),
			FixedIncome:        math.Round((wFi / wSum) * float64(totalAUM)),
			StructuredProducts: math.Round((wSp / wSum) * float64(totalAUM)),
			Funds:              math.Round((wFu / wSum) * float64(totalAUM)),
			Cash:               math.Round((wCash / wSum) * float64(totalAUM)),
		}

		id := fmt.Sprintf("CL-%d", 1000+i)
		var kycStatus string
		switch {
		case i%7 == 0:
			kycStatus = "Pending Review"
		case i%11 == 0:
			kycStatus = "Expired"
		default:
			kycStatus = "Verified"
		}

		segment := Pick(r, segments)
		if totalAUM > 15_000_000 {
			segment = "Private"
		}

		client := domain.Client{
			ID:           id,
			Name:         name,
			Segment:      segment,
			Rm:           rmName,
			RiskProfile:  Pick(r, riskProfiles),
			KycStatus:    kycStatus,
			TotalAUM:     totalAUM,
			AumBreakdown: aumBreakdown,
			AumTrend:     genMonthlyTrend(r, float64(totalAUM)),
			Holdings:     genHoldings(r, aumBreakdown),
			Contact: domain.Contact{
				Email:       lowerDotJoin(name) + "@mailbox.com",
				Phone:       fmt.Sprintf("+1 %d-%d-%d", r.RandInt(200, 999), r.RandInt(200, 999), r.RandInt(1000, 9999)),
				Address:     fmt.Sprintf("%d %s, %s", r.RandInt(1, 200), Pick(r, []string{"Park Ave", "Bahnhofstrasse", "Avenue Montaigne", "Orchard Rd", "Mayfair Sq"}), Pick(r, []string{"New York", "Zurich", "Paris", "Singapore", "London"})),
				Dob:         fmt.Sprintf("19%d-%s-%s", r.RandInt(45, 82), padLeft2(r.RandInt(1, 12)), padLeft2(r.RandInt(1, 28))),
				Nationality: Pick(r, nationalities),
			},
			AccountDetails: domain.AccountDetails{
				AccountNumber: fmt.Sprintf("AC-%d", r.RandInt(100000, 999999)),
				AccountType:   Pick(r, []string{"Discretionary", "Advisory", "Execution-Only"}),
				BaseCurrency:  Pick(r, currencies),
				OpenDate:      fmt.Sprintf("20%d-%s-%s", r.RandInt(10, 23), padLeft2(r.RandInt(1, 12)), padLeft2(r.RandInt(1, 28))),
				Custodian:     Pick(r, custodians),
			},
		}
		clients = append(clients, client)
	}

	// ---- Notes ---- (static, ported verbatim from mockData.ts)
	notes := []domain.Note{
		{ID: "N-1", Text: "Follow up with Alexandra Whitfield on structured note maturity proceeds reinvestment", Priority: "High", DueDate: "2026-07-08", Done: false, ClientID: strPtr("CL-1000")},
		{ID: "N-2", Text: "Prepare Q2 portfolio review deck for Marcus Chen", Priority: "High", DueDate: "2026-07-07", Done: false, ClientID: strPtr("CL-1001")},
		{ID: "N-3", Text: "Chase KYC renewal documents — expired accounts", Priority: "High", DueDate: "2026-07-10", Done: false, ClientID: nil},
		{ID: "N-4", Text: "Call Sofia Almeida re: risk profile update after recent conversation", Priority: "Medium", DueDate: "2026-07-14", Done: false, ClientID: strPtr("CL-1002")},
		{ID: "N-5", Text: "Send indicative pricing for autocall idea to James Sinclair", Priority: "Medium", DueDate: "2026-07-12", Done: false, ClientID: strPtr("CL-1003")},
		{ID: "N-6", Text: "Review onboarding checklist for prospective client referral", Priority: "Low", DueDate: "2026-07-20", Done: false, ClientID: nil},
		{ID: "N-7", Text: "Book travel for Zurich client visit week", Priority: "Low", DueDate: "2026-07-25", Done: false, ClientID: nil},
		{ID: "N-8", Text: "Confirm dividend reinvestment instructions with Elena Volkov", Priority: "Medium", DueDate: "2026-07-09", Done: true, ClientID: strPtr("CL-1004")},
		{ID: "N-9", Text: "Reconcile cash sweep discrepancy flagged by ops", Priority: "High", DueDate: "2026-07-06", Done: true, ClientID: nil},
		{ID: "N-10", Text: "Draft year-end tax pack outline for Private segment clients", Priority: "Low", DueDate: "2026-08-01", Done: false, ClientID: nil},
	}

	// ---- Transactions ----
	transactions := make([]domain.Transaction, 0, 132)
	for i := 0; i < 132; i++ {
		client := Pick(r, clients)
		productType := Pick(r, productTypes)
		action := Pick(r, actionsByType[productType])
		day := r.RandInt(1, 28)
		month := r.RandInt(1, 7)
		// Mirrors the original TS ternary chain exactly, including that the
		// second rand() call only happens when the first one falls through:
		// `rand() < 0.82 ? "Settled" : rand() < 0.6 ? "Pending" : "Failed"`
		var status string
		if r.Next() < 0.82 {
			status = "Settled"
		} else if r.Next() < 0.6 {
			status = "Pending"
		} else {
			status = "Failed"
		}
		transactions = append(transactions, domain.Transaction{
			ID:          fmt.Sprintf("TX-%d", 20260+i),
			Date:        fmt.Sprintf("2026-%s-%s", padLeft2(month), padLeft2(day)),
			ClientID:    client.ID,
			ClientName:  client.Name,
			ProductType: productType,
			ProductName: Pick(r, productsByType[productType]),
			Action:      action,
			Amount:      r.RandInt(15000, 3200000),
			Currency:    Pick(r, currencies),
			Status:      status,
		})
	}
	sort.SliceStable(transactions, func(i, j int) bool {
		return transactions[i].Date > transactions[j].Date
	})

	// ---- Calendar events ----
	calendarEvents := make([]domain.CalendarEvent, 0)
	evID := 1
	for month := 6; month <= 7; month++ {
		for d := 1; d <= 28; d++ {
			if r.Next() < 0.32 {
				client := Pick(r, clients)
				isInflow := r.Next() < 0.55
				var subtype, product string
				if isInflow {
					subtype = "inflow"
					product = Pick(r, []string{"Coupon Payment", "Dividend", "Note Maturity", "Interest Payment"})
				} else {
					subtype = "outflow"
					product = Pick(r, []string{"Subscription", "Management Fee", "Custody Fee"})
				}
				calendarEvents = append(calendarEvents, domain.CalendarEvent{
					ID:         fmt.Sprintf("EV-%d", evID),
					Date:       fmt.Sprintf("2026-%s-%s", padLeft2(month), padLeft2(d)),
					Type:       "cashflow",
					Subtype:    subtype,
					ClientID:   client.ID,
					ClientName: client.Name,
					Product:    product,
					Amount:     float64(r.RandInt(2000, 480000)),
					Currency:   Pick(r, currencies),
				})
				evID++
			}
			if r.Next() < 0.14 {
				client := Pick(r, clients)
				var holdingProduct string
				if len(client.Holdings) > 0 {
					h := Pick(r, client.Holdings)
					holdingProduct = h.Product
				} else {
					holdingProduct = "N/A"
				}
				calendarEvents = append(calendarEvents, domain.CalendarEvent{
					ID:          fmt.Sprintf("EV-%d", evID),
					Date:        fmt.Sprintf("2026-%s-%s", padLeft2(month), padLeft2(d)),
					Type:        "corporate_action",
					Subtype:     Pick(r, corpActionTypes),
					ClientID:    client.ID,
					ClientName:  client.Name,
					Product:     holdingProduct,
					Description: fmt.Sprintf("%s affecting holding position", Pick(r, corpActionTypes)),
				})
				evID++
			}
		}
	}

	// ---- Structured note orders ---- (static, ported verbatim)
	orders := []domain.Order{
		{ID: "ORD-501", ClientID: "CL-1000", ClientName: clients[0].Name, Underlyings: []string{"Apple Inc.", "Microsoft Corp."}, Tenor: "3Y", Barrier: 65, CouponType: "Autocall Memory", Notional: 500000, Currency: "USD", Status: "Booked", Quote: &domain.Quote{IndicativeCoupon: 8.4, IndicativePrice: 100.2}, CreatedDate: "2026-06-18"},
		{ID: "ORD-502", ClientID: "CL-1003", ClientName: clients[3].Name, Underlyings: []string{"Nestlé SA"}, Tenor: "2Y", Barrier: 70, CouponType: "Reverse Convertible", Notional: 250000, Currency: "CHF", Status: "Quoted", Quote: &domain.Quote{IndicativeCoupon: 6.9, IndicativePrice: 99.8}, CreatedDate: "2026-06-27"},
		{ID: "ORD-503", ClientID: "CL-1006", ClientName: clients[6].Name, Underlyings: []string{"EuroStoxx 50"}, Tenor: "5Y", Barrier: 60, CouponType: "Autocall Memory", Notional: 1000000, Currency: "EUR", Status: "Pending", Quote: nil, CreatedDate: "2026-07-01"},
		{ID: "ORD-504", ClientID: "CL-1011", ClientName: clients[11].Name, Underlyings: []string{"Gold Spot"}, Tenor: "3Y", Barrier: 75, CouponType: "Twin-Win", Notional: 350000, Currency: "USD", Status: "Rejected", Quote: &domain.Quote{IndicativeCoupon: 5.1, IndicativePrice: 98.4}, CreatedDate: "2026-06-10"},
	}

	rmProfile := domain.RmProfile{
		Name:     rmName,
		Title:    "Senior Relationship Manager",
		Initials: "CR",
		Desk:     "Private Banking — EMEA",
	}

	return Dataset{
		Clients:         clients,
		Notes:           notes,
		Transactions:    transactions,
		CalendarEvents:  calendarEvents,
		Orders:          orders,
		Underlyings:     underlyingOptions,
		RmProfile:       rmProfile,
		ModelPortfolios: ModelPortfolios,
	}
}

func lowerDotJoin(name string) string {
	out := make([]rune, 0, len(name))
	for _, ch := range name {
		if ch == ' ' {
			out = append(out, '.')
			continue
		}
		out = append(out, toLowerRune(ch))
	}
	return string(out)
}

func toLowerRune(ch rune) rune {
	if ch >= 'A' && ch <= 'Z' {
		return ch + ('a' - 'A')
	}
	return ch
}
