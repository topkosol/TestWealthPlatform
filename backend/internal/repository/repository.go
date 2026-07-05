// Package repository defines the persistence-layer interfaces used by the
// service layer. Only interfaces live here — concrete implementations
// (in-memory today, potentially a real database later) live in subpackages
// such as internal/repository/memory. Depending only on these interfaces
// is what makes swapping in a DB-backed implementation later a matter of
// writing a new package, not touching the service or handler layers.
package repository

import "wealthplatform-backend/internal/domain"

// ClientRepository provides read access to client records. Clients are
// seeded once at startup and are read-only for the lifetime of the process.
type ClientRepository interface {
	All() []domain.Client
	GetByID(id string) (domain.Client, bool)
}

// TransactionRepository provides read access to transaction history.
type TransactionRepository interface {
	All() []domain.Transaction
}

// CalendarRepository provides read access to calendar events (cashflows and
// corporate actions).
type CalendarRepository interface {
	All() []domain.CalendarEvent
}

// NoteRepository provides read/write access to RM notes/tasks.
type NoteRepository interface {
	All() []domain.Note
	Create(note domain.Note) domain.Note
	ToggleDone(id string) (domain.Note, bool)
}

// OrderRepository provides read/write access to structured product orders.
type OrderRepository interface {
	All() []domain.Order
	Create(order domain.Order) domain.Order
}

// ReferenceRepository provides read access to miscellaneous reference data:
// the relationship manager's profile, the list of tradable underlyings, and
// the house model portfolio target allocations per risk profile.
type ReferenceRepository interface {
	RmProfile() domain.RmProfile
	Underlyings() []string
	ModelPortfolios() map[string]domain.AumBreakdown
}
