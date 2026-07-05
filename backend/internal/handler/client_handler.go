package handler

import (
	"net/http"

	"wealthplatform-backend/internal/service"
)

type ClientHandler struct {
	svc *service.ClientService
}

func NewClientHandler(svc *service.ClientService) *ClientHandler {
	return &ClientHandler{svc: svc}
}

// List handles GET /api/clients.
func (h *ClientHandler) List(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.svc.List())
}
