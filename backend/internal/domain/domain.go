// Package domain holds plain data structures shared across the backend.
// These mirror the shapes in the frontend's src/types.ts exactly (field
// names, nesting, nullability) so the JSON produced here is a drop-in
// replacement for the mock data the frontend used to generate itself.
package domain

// Segment, RiskProfile, KycStatus, Currency and AssetClass are modeled as
// plain strings (rather than Go enums) since they only ever need to be
// serialized/deserialized as JSON strings.

type Holding struct {
	Product    string  `json:"product"`
	AssetClass string  `json:"assetClass"`
	Quantity   int     `json:"quantity"`
	Value      int     `json:"value"`
	Currency   string  `json:"currency"`
	YtdReturn  float64 `json:"ytdReturn"`
}

type AumBreakdown struct {
	Equities           float64 `json:"equities"`
	FixedIncome        float64 `json:"fixedIncome"`
	StructuredProducts float64 `json:"structuredProducts"`
	Funds              float64 `json:"funds"`
	Cash               float64 `json:"cash"`
}

type Contact struct {
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Address     string `json:"address"`
	Dob         string `json:"dob"`
	Nationality string `json:"nationality"`
}

type AccountDetails struct {
	AccountNumber string `json:"accountNumber"`
	AccountType   string `json:"accountType"`
	BaseCurrency  string `json:"baseCurrency"`
	OpenDate      string `json:"openDate"`
	Custodian     string `json:"custodian"`
}

type Client struct {
	ID             string         `json:"id"`
	Name           string         `json:"name"`
	Segment        string         `json:"segment"`
	Rm             string         `json:"rm"`
	RiskProfile    string         `json:"riskProfile"`
	KycStatus      string         `json:"kycStatus"`
	TotalAUM       int            `json:"totalAUM"`
	AumBreakdown   AumBreakdown   `json:"aumBreakdown"`
	AumTrend       []int          `json:"aumTrend"`
	Holdings       []Holding      `json:"holdings"`
	Contact        Contact        `json:"contact"`
	AccountDetails AccountDetails `json:"accountDetails"`
}

type Note struct {
	ID       string  `json:"id"`
	Text     string  `json:"text"`
	Priority string  `json:"priority"`
	DueDate  string  `json:"dueDate"`
	Done     bool    `json:"done"`
	ClientID *string `json:"clientId"`
}

type Transaction struct {
	ID          string `json:"id"`
	Date        string `json:"date"`
	ClientID    string `json:"clientId"`
	ClientName  string `json:"clientName"`
	ProductType string `json:"productType"`
	ProductName string `json:"productName"`
	Action      string `json:"action"`
	Amount      int    `json:"amount"`
	Currency    string `json:"currency"`
	Status      string `json:"status"`
}

// CalendarEvent covers both the "cashflow" and "corporate_action" variants
// from the frontend's discriminated union. Fields that only apply to one
// variant are tagged omitempty so the JSON shape matches what the frontend
// expects for each `type`.
type CalendarEvent struct {
	ID          string  `json:"id"`
	Date        string  `json:"date"`
	Type        string  `json:"type"`
	Subtype     string  `json:"subtype"`
	ClientID    string  `json:"clientId"`
	ClientName  string  `json:"clientName"`
	Product     string  `json:"product"`
	Amount      float64 `json:"amount,omitempty"`
	Currency    string  `json:"currency,omitempty"`
	Description string  `json:"description,omitempty"`
}

type Quote struct {
	IndicativeCoupon float64 `json:"indicativeCoupon"`
	IndicativePrice  float64 `json:"indicativePrice"`
}

type Order struct {
	ID          string   `json:"id"`
	ClientID    string   `json:"clientId"`
	ClientName  string   `json:"clientName"`
	Underlyings []string `json:"underlyings"`
	Tenor       string   `json:"tenor"`
	Barrier     float64  `json:"barrier"`
	CouponType  string   `json:"couponType"`
	Notional    float64  `json:"notional"`
	Currency    string   `json:"currency"`
	Status      string   `json:"status"`
	Quote       *Quote   `json:"quote"`
	CreatedDate string   `json:"createdDate"`
}

type RmProfile struct {
	Name     string `json:"name"`
	Title    string `json:"title"`
	Initials string `json:"initials"`
	Desk     string `json:"desk"`
}
