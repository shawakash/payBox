package types

import (
    "github.com/go-playground/validator/v10"
)

var Validate = validator.New()

type TxnSign struct {
    From string `json:"from" validate:"required"`
	To string `json:"to" validate:"required"`
	Amount float64 `json:"amount" validate:"required"`
	Network string `json:"network" validate:"required"`
	Cluster string `json:"cluster" validate:"required"`
	Wait bool `json:"wait"`
}

type TxnGet struct {
	Hash string `json:"hash" validate:"required"`
	// Network string `json:"network" validate:"required"`
	// Cluster string `json:"cluster" validate:"required"`
}