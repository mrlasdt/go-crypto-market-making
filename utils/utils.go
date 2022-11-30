package utils

import (
	"fmt"
	"strconv"

	"golang.org/x/exp/constraints"
)

func CvtStrToFloat32(s string) float32 {
	val, err := strconv.ParseFloat(s, 32)
	if err != nil {
		panic(fmt.Sprintf("Cannot convert %s to float32", s))
	}
	return float32(val)
}

func CvtStrToFloat64(s string) float64 {
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		panic(fmt.Sprintf("Cannot convert %s to float32", s))
	}
	return val
}

func Min[T constraints.Ordered](a, b T) T {
	if a < b {
		return a
	}
	return b
}
