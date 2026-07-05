package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"wealthplatform-backend/internal/domain"
	"wealthplatform-backend/internal/repository"
)

// ErrEmptyText is returned when a note is created with blank text.
var ErrEmptyText = errors.New("text must not be empty")

// ErrNoteNotFound is returned when toggling a note id that doesn't exist.
var ErrNoteNotFound = errors.New("note not found")

type NoteService struct {
	repo repository.NoteRepository
}

func NewNoteService(repo repository.NoteRepository) *NoteService {
	return &NoteService{repo: repo}
}

func (s *NoteService) List() []domain.Note {
	return s.repo.All()
}

// CreateNoteInput is the payload required to create a note.
type CreateNoteInput struct {
	Text     string
	Priority string
	DueDate  string
	ClientID *string
}

func (s *NoteService) Create(input CreateNoteInput) (domain.Note, error) {
	if strings.TrimSpace(input.Text) == "" {
		return domain.Note{}, ErrEmptyText
	}
	note := domain.Note{
		ID:       fmt.Sprintf("N-%d", time.Now().UnixMilli()),
		Text:     input.Text,
		Priority: input.Priority,
		DueDate:  input.DueDate,
		Done:     false,
		ClientID: input.ClientID,
	}
	return s.repo.Create(note), nil
}

func (s *NoteService) ToggleDone(id string) (domain.Note, error) {
	note, ok := s.repo.ToggleDone(id)
	if !ok {
		return domain.Note{}, ErrNoteNotFound
	}
	return note, nil
}
