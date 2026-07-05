package httpserver

import (
	"net/http"

	"wealthplatform-backend/internal/handler"
)

// Handlers bundles every handler the router needs to wire up.
type Handlers struct {
	Client      *handler.ClientHandler
	Transaction *handler.TransactionHandler
	Calendar    *handler.CalendarHandler
	Order       *handler.OrderHandler
	Note        *handler.NoteHandler
	Reference   *handler.ReferenceHandler
}

// NewRouter builds the full http.Handler for the API, with all routes
// registered under /api and CORS + logging middleware applied.
func NewRouter(h Handlers) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/clients", h.Client.List)

	mux.HandleFunc("GET /api/transactions", h.Transaction.List)

	mux.HandleFunc("GET /api/calendar-events", h.Calendar.List)

	mux.HandleFunc("GET /api/orders", h.Order.List)
	mux.HandleFunc("POST /api/orders/quote", h.Order.Quote)
	mux.HandleFunc("POST /api/orders", h.Order.Create)

	mux.HandleFunc("GET /api/notes", h.Note.List)
	mux.HandleFunc("POST /api/notes", h.Note.Create)
	mux.HandleFunc("PATCH /api/notes/{id}/toggle", h.Note.ToggleDone)

	mux.HandleFunc("GET /api/rm-profile", h.Reference.RmProfile)
	mux.HandleFunc("GET /api/underlyings", h.Reference.Underlyings)
	mux.HandleFunc("GET /api/model-portfolios", h.Reference.ModelPortfolios)

	return loggingMiddleware(corsMiddleware(mux))
}
