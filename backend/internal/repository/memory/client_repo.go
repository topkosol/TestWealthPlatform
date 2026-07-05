// Package memory provides in-memory implementations of the repository
// interfaces, seeded from internal/mockdata at construction time. These
// stand in for a future real-database-backed implementation; the service
// layer depends only on the repository interfaces, so swapping these out
// later shouldn't require any changes above the repository layer.
package memory

import "wealthplatform-backend/internal/domain"

// ClientRepo is a read-only, in-memory ClientRepository implementation.
type ClientRepo struct {
	clients []domain.Client
	byID    map[string]domain.Client
}

// NewClientRepo constructs a ClientRepo seeded with the given clients.
func NewClientRepo(clients []domain.Client) *ClientRepo {
	byID := make(map[string]domain.Client, len(clients))
	for _, c := range clients {
		byID[c.ID] = c
	}
	return &ClientRepo{clients: clients, byID: byID}
}

func (r *ClientRepo) All() []domain.Client {
	out := make([]domain.Client, len(r.clients))
	copy(out, r.clients)
	return out
}

func (r *ClientRepo) GetByID(id string) (domain.Client, bool) {
	c, ok := r.byID[id]
	return c, ok
}
