package memory

import "wealthplatform-backend/internal/domain"

// CalendarRepo is a read-only, in-memory CalendarRepository implementation.
type CalendarRepo struct {
	events []domain.CalendarEvent
}

func NewCalendarRepo(events []domain.CalendarEvent) *CalendarRepo {
	return &CalendarRepo{events: events}
}

func (r *CalendarRepo) All() []domain.CalendarEvent {
	out := make([]domain.CalendarEvent, len(r.events))
	copy(out, r.events)
	return out
}
