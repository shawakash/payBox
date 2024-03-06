package sockets

import (
	"fmt"
	"log"
	"os"
	
	"mote/src/config"

	btc "github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/rpcclient"
)

func SendBtc(from string, to string, amt float64, wait bool) (string, error) {
	rpcClient, err := rpcclient.New(&rpcclient.ConnConfig{
		Host:         config.BTC_RPC_HOST, // Default RPC port for Bitcoin Core
		User:         config.BTC_RPC_USER,
		Pass:         config.BTC_RPC_PASS,
		HTTPPostMode: config.BTC_POST_MODE,
	}, nil)
	if err != nil {
		log.Println("Failed to connect to the RPC server:", err)
		os.Exit(1)
	}
	defer rpcClient.Shutdown()

	recipientAddr, err := btc.DecodeAddress(to, nil)
	if err != nil {
		log.Println("Failed to decode recipient address:", err)
		os.Exit(1)
	}

	amount := btc.Amount(amt)

	// Create and send the transaction
	txHash, err := rpcClient.SendToAddress(recipientAddr, amount)
	if err != nil {
		fmt.Println("Failed to send transaction:", err)
		os.Exit(1)
	}



	log.Println("hash: ", txHash)
	return txHash.String(), nil
}
