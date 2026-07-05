package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"wealthplatform-backend/internal/service"
)

type NoteHandler struct {
	svc *service.NoteService
}

func NewNoteHandler(svc *service.NoteService) *NoteHandler {
	return &NoteHandler{svc: svc}
}

// List handles GET /api/notes.
func (h *NoteHandler) List(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.svc.List())
}

type createNoteRequest struct {
	Text     string  `json:"text"`
	Priority string  `json:"priority"`
	DueDate  string  `json:"dueDate"`
	ClientID *string `json:"clientId"`
}

// Create handles POST /api/notes.
func (h *NoteHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req createNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	note, err := h.svc.Create(service.CreateNoteInput{
		Text:     req.Text,
		Priority: req.Priority,
		DueDate:  req.DueDate,
		ClientID: req.ClientID,
	})
	if err != nil {
		if errors.Is(err, service.ErrEmptyText) {
			writeError(w, http.StatusBadRequest, "text must not be empty")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to create note")
		return
	}
	writeJSON(w, http.StatusCreated, note)
}

// ToggleDone handles PATCH /api/notes/{id}/toggle.
func (h *NoteHandler) ToggleDone(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	note, err := h.svc.ToggleDone(id)
	if err != nil {
		if errors.Is(err, service.ErrNoteNotFound) {
			writeError(w, http.StatusNotFound, "note not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to toggle note")
		return
	}
	writeJSON(w, http.StatusOK, note)
}
