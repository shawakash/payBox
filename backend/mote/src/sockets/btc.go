package sockets

import (
	"fmt"
	"log"
	"os"
	"time"

	"mote/src/config"

	"github.com/btcsuite/btcd/btcjson"
	btc "github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/rpcclient"
)

func SendBtc(from string, to string, amt float64, wait bool) (*btcjson.TxRawResult, error) {
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

	var txn = &btcjson.TxRawResult{
		Txid: txHash.String(),
		Time: time.Now().Unix(),
	}

	if wait {
		tx, err := rpcClient.GetRawTransactionVerbose(txHash)
		if err != nil {
			log.Fatal("Failed to fetch transaction details:", err)
		}
		txn = tx
	}


	log.Println("hash: ", txHash)
	return txn, nil
}
