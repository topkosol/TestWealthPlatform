// Package service holds business logic. Services depend only on repository
// interfaces (never concrete implementations), which is the seam that lets
// a future real-database-backed repository package slot in without any
// change to this layer.
package service

import (
	"wealthplatform-backend/internal/domain"
	"wealthplatform-backend/internal/repository"
)

type ClientService struct {
	repo repository.ClientRepository
}

func NewClientService(repo repository.ClientRepository) *ClientService {
	return &ClientService{repo: repo}
}

func (s *ClientService) List() []domain.Client {
	return s.repo.All()
}

func (s *ClientService) Get(id string) (domain.Client, bool) {
	return s.repo.GetByID(id)
}
