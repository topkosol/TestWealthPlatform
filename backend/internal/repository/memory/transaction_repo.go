package memory

import "wealthplatform-backend/internal/domain"

// TransactionRepo is a read-only, in-memory TransactionRepository implementation.
type TransactionRepo struct {
	transactions []domain.Transaction
}

func NewTransactionRepo(transactions []domain.Transaction) *TransactionRepo {
	return &TransactionRepo{transactions: transactions}
}

func (r *TransactionRepo) All() []domain.Transaction {
	out := make([]domain.Transaction, len(r.transactions))
	copy(out, r.transactions)
	return out
}
