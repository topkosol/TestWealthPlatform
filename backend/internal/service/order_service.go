package service

import (
	"fmt"
	"math"
	"time"

	"wealthplatform-backend/internal/domain"
	"wealthplatform-backend/internal/repository"
)

// couponBase mirrors COUPON_BASE from StructuredOrderModule.tsx.
var couponBase = map[string]float64{
	"Autocall Memory":     8.5,
	"Reverse Convertible": 6.8,
	"Twin-Win":            5.4,
	"Fixed Coupon":        4.2,
}

type OrderService struct {
	repo repository.OrderRepository
}

func NewOrderService(repo repository.OrderRepository) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) List() []domain.Order {
	return s.repo.All()
}

// QuoteInput mirrors the inputs used by the frontend's requestQuote to
// derive an indicative quote.
type QuoteInput struct {
	UnderlyingsCount int
	Barrier          float64
	Notional         float64
	CouponType       string
}

// Quote is the pure business-logic port of requestQuote() from
// StructuredOrderModule.tsx. It is intentionally deterministic (no
// randomness) — as in the original mock, the "seed" is derived purely from
// the request inputs, not real market pricing. In production this would be
// replaced by a call to an authenticated pricing service.
func (s *OrderService) Quote(input QuoteInput) domain.Quote {
	base, ok := couponBase[input.CouponType]
	if !ok {
		base = 6
	}
	barrierAdj := (90 - input.Barrier) * 0.06
	mockSeed := math.Mod(float64(input.UnderlyingsCount)*0.3+input.Barrier*0.01+input.Notional*0.000001, 1)
	coupon := roundTo2(base + barrierAdj + (mockSeed*1.2 - 0.6))
	price := roundTo2(99.4 + mockSeed*1.2)
	return domain.Quote{IndicativeCoupon: coupon, IndicativePrice: price}
}

func roundTo2(v float64) float64 {
	return math.Round(v*100) / 100
}

// CreateOrderInput is the payload required to book a new order.
type CreateOrderInput struct {
	ClientID    string
	ClientName  string
	Underlyings []string
	Tenor       string
	Barrier     float64
	CouponType  string
	Notional    float64
	Currency    string
	Quote       domain.Quote
}

func (s *OrderService) Create(input CreateOrderInput) domain.Order {
	q := input.Quote
	order := domain.Order{
		ID:          fmt.Sprintf("ORD-%d", time.Now().UnixNano()%1_000_000),
		ClientID:    input.ClientID,
		ClientName:  input.ClientName,
		Underlyings: input.Underlyings,
		Tenor:       input.Tenor,
		Barrier:     input.Barrier,
		CouponType:  input.CouponType,
		Notional:    input.Notional,
		Currency:    input.Currency,
		Status:      "Booked",
		Quote:       &q,
		CreatedDate: time.Now().Format("2006-01-02"),
	}
	return s.repo.Create(order)
}
