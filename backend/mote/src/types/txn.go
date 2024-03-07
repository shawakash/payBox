package types

import (
	"math/big"
	"time"

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
	Network string `json:"network" validate:"required"`
	// Cluster string `json:"cluster" validate:"required"`
}

type Txn struct {
	Hash string `json:"hash"`
	Network string `json:"network"`
	Cluster string `json:"cluster"`
	Timestamp time.Time `json:"time"`
	Slot uint64 `json:"slot"`
	From string `json:"from"`
	To string `json:"to"`
	BlockHash string `json:"blockHash"`
	Amt float64 `json:"amount"`
	Fee float64 `json:"fee"`
	Status string `json:"status"`
	ClientId string `json:"clientId"`
	ChainId *big.Int `json:"chainId,omitempty"`
}


type Message struct {
    Key   string                 `json:"key"`
    Value Txn `json:"value"`
}
