// Package handler contains net/http handlers: decode request JSON, call
// into the service layer, and encode JSON responses with appropriate
// status codes.
package handler

import (
	"encoding/json"
	"net/http"
)

// writeJSON encodes v as JSON to w with the given status code and the
// correct Content-Type header.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// errorResponse is the small `{"error": "message"}` body returned on failure.
type errorResponse struct {
	Error string `json:"error"`
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorResponse{Error: message})
}
