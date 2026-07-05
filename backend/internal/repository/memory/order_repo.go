package memory

import (
	"sync"

	"wealthplatform-backend/internal/domain"
)

// OrderRepo is a mutable, thread-safe, in-memory OrderRepository
// implementation. Orders support create, so access is guarded by a mutex.
type OrderRepo struct {
	mu     sync.Mutex
	orders []domain.Order
}

func NewOrderRepo(orders []domain.Order) *OrderRepo {
	return &OrderRepo{orders: orders}
}

func (r *OrderRepo) All() []domain.Order {
	r.mu.Lock()
	defer r.mu.Unlock()
	out := make([]domain.Order, len(r.orders))
	copy(out, r.orders)
	return out
}

// Create prepends the order to the list, matching the frontend's behavior
// of showing newly-booked orders first.
func (r *OrderRepo) Create(order domain.Order) domain.Order {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.orders = append([]domain.Order{order}, r.orders...)
	return order
}
