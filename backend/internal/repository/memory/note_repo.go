package memory

import (
	"sync"

	"wealthplatform-backend/internal/domain"
)

// NoteRepo is a mutable, thread-safe, in-memory NoteRepository
// implementation. Notes support create and toggle-done operations, so
// access is guarded by a mutex.
type NoteRepo struct {
	mu    sync.Mutex
	notes []domain.Note
}

func NewNoteRepo(notes []domain.Note) *NoteRepo {
	return &NoteRepo{notes: notes}
}

func (r *NoteRepo) All() []domain.Note {
	r.mu.Lock()
	defer r.mu.Unlock()
	out := make([]domain.Note, len(r.notes))
	copy(out, r.notes)
	return out
}

// Create prepends the note to the list, matching the frontend's behavior
// of showing newly-added notes first.
func (r *NoteRepo) Create(note domain.Note) domain.Note {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.notes = append([]domain.Note{note}, r.notes...)
	return note
}

// ToggleDone flips the Done flag on the note with the given id.
func (r *NoteRepo) ToggleDone(id string) (domain.Note, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for i, n := range r.notes {
		if n.ID == id {
			r.notes[i].Done = !r.notes[i].Done
			return r.notes[i], true
		}
	}
	return domain.Note{}, false
}
