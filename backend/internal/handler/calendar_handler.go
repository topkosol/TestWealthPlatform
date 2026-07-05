package handler

import (
	"net/http"

	"wealthplatform-backend/internal/service"
)

type CalendarHandler struct {
	svc *service.CalendarService
}

func NewCalendarHandler(svc *service.CalendarService) *CalendarHandler {
	return &CalendarHandler{svc: svc}
}

// List handles GET /api/calendar-events.
func (h *CalendarHandler) List(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.svc.List())
}
