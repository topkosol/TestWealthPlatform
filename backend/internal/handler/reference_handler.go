package handler

import (
	"net/http"

	"wealthplatform-backend/internal/service"
)

type ReferenceHandler struct {
	svc *service.ReferenceService
}

func NewReferenceHandler(svc *service.ReferenceService) *ReferenceHandler {
	return &ReferenceHandler{svc: svc}
}

// RmProfile handles GET /api/rm-profile.
func (h *ReferenceHandler) RmProfile(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.svc.RmProfile())
}

// Underlyings handles GET /api/underlyings.
func (h *ReferenceHandler) Underlyings(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.svc.Underlyings())
}

// ModelPortfolios handles GET /api/model-portfolios.
func (h *ReferenceHandler) ModelPortfolios(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.svc.ModelPortfolios())
}
