// Package httpserver wires the handler layer into a net/http.ServeMux,
// registers all routes under the /api prefix, and applies cross-cutting
// middleware (CORS, request logging).
package httpserver

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// allowedOrigins returns the extra origins (beyond localhost/127.0.0.1)
// permitted to call this API, configured via the comma-separated
// ALLOWED_ORIGINS env var (e.g. "https://my-app.vercel.app").
func allowedOrigins() []string {
	raw := os.Getenv("ALLOWED_ORIGINS")
	if raw == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			origins = append(origins, p)
		}
	}
	return origins
}

// corsMiddleware allows the local Vite dev server, plus any origin listed
// in ALLOWED_ORIGINS (e.g. the deployed frontend), to call this API from
// the browser. Vite picks the next free port (5173, 5174, ...) when the
// default is taken, so any localhost/127.0.0.1 origin is reflected back
// rather than hard-coding a single port.
func corsMiddleware(next http.Handler) http.Handler {
	extra := allowedOrigins()
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:") {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			for _, o := range extra {
				if origin == o {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// loggingMiddleware logs method, path, status code and duration for every
// request.
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)
		log.Printf("%s %s %d %s", r.Method, r.URL.Path, sw.status, time.Since(start))
	})
}

// statusWriter captures the status code written by a handler so the
// logging middleware can report it.
type statusWriter struct {
	http.ResponseWriter
	status int
}

func (sw *statusWriter) WriteHeader(status int) {
	sw.status = status
	sw.ResponseWriter.WriteHeader(status)
}
