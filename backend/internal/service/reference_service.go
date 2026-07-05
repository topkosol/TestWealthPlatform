package service

import (
	"wealthplatform-backend/internal/domain"
	"wealthplatform-backend/internal/repository"
)

type ReferenceService struct {
	repo repository.ReferenceRepository
}

func NewReferenceService(repo repository.ReferenceRepository) *ReferenceService {
	return &ReferenceService{repo: repo}
}

func (s *ReferenceService) RmProfile() domain.RmProfile {
	return s.repo.RmProfile()
}

func (s *ReferenceService) Underlyings() []string {
	return s.repo.Underlyings()
}

func (s *ReferenceService) ModelPortfolios() map[string]domain.AumBreakdown {
	return s.repo.ModelPortfolios()
}
