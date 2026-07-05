package handler

import (
	"encoding/json"
	"net/http"

	"wealthplatform-backend/internal/domain"
	"wealthplatform-backend/internal/service"
)

type OrderHandler struct {
	svc *service.OrderService
}

func NewOrderHandler(svc *service.OrderService) *OrderHandler {
	return &OrderHandler{svc: svc}
}

// List handles GET /api/orders.
func (h *OrderHandler) List(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.svc.List())
}

type quoteRequest struct {
	UnderlyingsCount int     `json:"underlyingsCount"`
	Barrier          float64 `json:"barrier"`
	Notional         float64 `json:"notional"`
	CouponType       string  `json:"couponType"`
}

// Quote handles POST /api/orders/quote.
func (h *OrderHandler) Quote(w http.ResponseWriter, r *http.Request) {
	var req quoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	quote := h.svc.Quote(service.QuoteInput{
		UnderlyingsCount: req.UnderlyingsCount,
		Barrier:          req.Barrier,
		Notional:         req.Notional,
		CouponType:       req.CouponType,
	})
	writeJSON(w, http.StatusOK, quote)
}

type createOrderRequest struct {
	ClientID    string       `json:"clientId"`
	ClientName  string       `json:"clientName"`
	Underlyings []string     `json:"underlyings"`
	Tenor       string       `json:"tenor"`
	Barrier     float64      `json:"barrier"`
	CouponType  string       `json:"couponType"`
	Notional    float64      `json:"notional"`
	Currency    string       `json:"currency"`
	Quote       domain.Quote `json:"quote"`
}

// Create handles POST /api/orders.
func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req createOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.ClientID == "" {
		writeError(w, http.StatusBadRequest, "clientId is required")
		return
	}
	if len(req.Underlyings) == 0 {
		writeError(w, http.StatusBadRequest, "at least one underlying is required")
		return
	}
	if req.Notional <= 0 {
		writeError(w, http.StatusBadRequest, "notional must be positive")
		return
	}
	order := h.svc.Create(service.CreateOrderInput{
		ClientID:    req.ClientID,
		ClientName:  req.ClientName,
		Underlyings: req.Underlyings,
		Tenor:       req.Tenor,
		Barrier:     req.Barrier,
		CouponType:  req.CouponType,
		Notional:    req.Notional,
		Currency:    req.Currency,
		Quote:       req.Quote,
	})
	writeJSON(w, http.StatusCreated, order)
}
