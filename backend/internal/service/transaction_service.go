package service

import (
	"wealthplatform-backend/internal/domain"
	"wealthplatform-backend/internal/repository"
)

type TransactionService struct {
	repo repository.TransactionRepository
}

func NewTransactionService(repo repository.TransactionRepository) *TransactionService {
	return &TransactionService{repo: repo}
}

func (s *TransactionService) List() []domain.Transaction {
	return s.repo.All()
}
