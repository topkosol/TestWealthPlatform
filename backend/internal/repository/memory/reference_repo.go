package memory

import "wealthplatform-backend/internal/domain"

// ReferenceRepo is a read-only, in-memory ReferenceRepository implementation
// holding the RM profile, tradable underlyings, and model portfolios.
type ReferenceRepo struct {
	rmProfile       domain.RmProfile
	underlyings     []string
	modelPortfolios map[string]domain.AumBreakdown
}

func NewReferenceRepo(rmProfile domain.RmProfile, underlyings []string, modelPortfolios map[string]domain.AumBreakdown) *ReferenceRepo {
	return &ReferenceRepo{
		rmProfile:       rmProfile,
		underlyings:     underlyings,
		modelPortfolios: modelPortfolios,
	}
}

func (r *ReferenceRepo) RmProfile() domain.RmProfile {
	return r.rmProfile
}

func (r *ReferenceRepo) Underlyings() []string {
	out := make([]string, len(r.underlyings))
	copy(out, r.underlyings)
	return out
}

func (r *ReferenceRepo) ModelPortfolios() map[string]domain.AumBreakdown {
	out := make(map[string]domain.AumBreakdown, len(r.modelPortfolios))
	for k, v := range r.modelPortfolios {
		out[k] = v
	}
	return out
}
