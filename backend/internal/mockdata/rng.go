package mockdata

// Rng is a faithful port of the mulberry32 PRNG used by the frontend's
// src/data/mockData.ts, so that seeding with the same value produces data
// of the same shape/ranges. All intermediate arithmetic is done with
// uint32 values, which mirrors the 32-bit bitwise semantics (|0, >>>,
// Math.imul) that the original JavaScript implementation relies on.
//
// Original JS:
//
//	function mulberry32(a) {
//	  return function () {
//	    a |= 0;
//	    a = (a + 0x6d2b79f5) | 0;
//	    let t = Math.imul(a ^ (a >>> 15), 1 | a);
//	    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
//	    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
//	  };
//	}
type Rng struct {
	a uint32
}

// NewRng creates a new PRNG seeded deterministically.
func NewRng(seed uint32) *Rng {
	return &Rng{a: seed}
}

// Next returns the next pseudo-random float64 in [0, 1).
func (r *Rng) Next() float64 {
	r.a += 0x6d2b79f5
	a := r.a
	t := (a ^ (a >> 15)) * (a | 1)
	t = (t + (t^(t>>7))*(t|61)) ^ t
	return float64(t^(t>>14)) / 4294967296
}

// Pick returns a pseudo-random element of arr.
func Pick[T any](r *Rng, arr []T) T {
	idx := int(r.Next() * float64(len(arr)))
	return arr[idx]
}

// RandInt returns a pseudo-random integer in [min, max] inclusive.
func (r *Rng) RandInt(min, max int) int {
	return int(r.Next()*float64(max-min+1)) + min
}

// RandFloat returns a pseudo-random float in [min, max), rounded to dp
// decimal places (matching the `+(...).toFixed(dp)` idiom in the TS source).
func (r *Rng) RandFloat(min, max float64, dp int) float64 {
	v := r.Next()*(max-min) + min
	return roundTo(v, dp)
}

func roundTo(v float64, dp int) float64 {
	mult := 1.0
	for i := 0; i < dp; i++ {
		mult *= 10
	}
	if v >= 0 {
		return float64(int64(v*mult+0.5)) / mult
	}
	return float64(int64(v*mult-0.5)) / mult
}
