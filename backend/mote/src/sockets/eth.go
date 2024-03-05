package sockets

import (
	"context"
	"crypto/ecdsa"
	"log"
	"math"
	"math/big"
	"strings"

	"mote/src/config"

	// "github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	// "github.com/ethereum/go-ethereum/rpc"
)

func SendEth(from string, to string, amount float64, wait bool) (*types.Transaction, error) {
	client, err := ethclient.Dial(config.INFURA_SEPOLIA_URL)
    if err != nil {
        log.Fatalf("Failed to connect to the Ethereum client: %v", err)
    }

    fromPrivate, err := crypto.HexToECDSA(strings.TrimPrefix(from, "0x"))
    if err != nil {
        log.Fatalf("Failed to decode private key: %v", err)
    }

    fromPublic := fromPrivate.Public()
    fromPublicECDSA, ok := fromPublic.(*ecdsa.PublicKey)
    if !ok {
        log.Fatal("Cannot assert type: publicKey is not of type *ecdsa.PublicKey")
    }

    fromAddress := crypto.PubkeyToAddress(*fromPublicECDSA)
    nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
    if err != nil {
        log.Fatalf("Failed to get nonce: %v", err)
    }

    amountInWei := new(big.Float).Mul(big.NewFloat(amount), big.NewFloat(math.Pow10(18)))
    value := new(big.Int)
    amountInWei.Int(value)
    gasLimit := uint64(21000)
    gasPrice, err := client.SuggestGasPrice(context.Background())
    if err != nil {
        log.Fatalf("Failed to suggest gas price: %v", err)
    }

    toAddress := common.HexToAddress(to)
    var data []byte
    tx := types.NewTransaction(
		nonce, 
		toAddress, 
		value, 
		gasLimit, 
		gasPrice, 
		data,
	)

    chainID, err := client.NetworkID(context.Background())
    if err != nil {
        log.Fatalf("Failed to get chain ID: %v", err)
    }

    signedTx, err := types.SignTx(
		tx, 
		types.NewEIP155Signer(chainID), 
		fromPrivate,
	)
    if err != nil {
        log.Fatalf("Failed to sign tx: %v", err)
    }

    err = client.SendTransaction(context.Background(), signedTx)
    if err != nil {
        log.Fatalf("Failed to send transaction: %v", err)
    }

    log.Println("txn: ", signedTx)
	return signedTx, nil
}