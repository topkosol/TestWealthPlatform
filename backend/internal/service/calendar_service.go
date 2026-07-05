package service

import (
	"wealthplatform-backend/internal/domain"
	"wealthplatform-backend/internal/repository"
)

type CalendarService struct {
	repo repository.CalendarRepository
}

func NewCalendarService(repo repository.CalendarRepository) *CalendarService {
	return &CalendarService{repo: repo}
}

func (s *CalendarService) List() []domain.CalendarEvent {
	return s.repo.All()
}
