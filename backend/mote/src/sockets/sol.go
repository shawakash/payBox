package sockets

import (
	"context"
	"log"
	"time"

	solana "github.com/blocto/solana-go-sdk/client"
	"github.com/blocto/solana-go-sdk/common"
	"github.com/blocto/solana-go-sdk/program/system"
	"github.com/blocto/solana-go-sdk/rpc"
	"github.com/blocto/solana-go-sdk/types"
	
)

type SendSolResult struct {
    TxnHash string
    Txn     types.Transaction
}

func SendSol(from string, to string, amount float64) (*SendSolResult, error) {
	fromAccount, _ := types.AccountFromBase58(from)
	log.Println("fromAccount:", fromAccount.PublicKey.ToBase58())
	client := solana.NewClient(rpc.DevnetRPCEndpoint)

	// // Air droping
	// sig, err := client.RequestAirdrop(
	// 	context.TODO(),
	// 	fromAccount.PublicKey.ToBase58(),
	// 	1e9,
	// )
	// if err != nil {
	// 	log.Fatalf("failed to request airdrop, err: %v", err)
	// }
	// log.Println(sig)

	// to fetch recent blockhash
	recentBlockhashResponse, err := client.GetLatestBlockhash(context.Background())
	if err != nil {
		log.Fatalf("failed to get recent blockhash, err: %v", err)
	}

	lamports := uint64(amount * 1e9)

	// create a transfer tx
	tx, err := types.NewTransaction(types.NewTransactionParam{
		Signers: []types.Account{fromAccount},
		Message: types.NewMessage(types.NewMessageParam{
			FeePayer:        fromAccount.PublicKey,
			RecentBlockhash: recentBlockhashResponse.Blockhash,
			Instructions: []types.Instruction{
				system.Transfer(system.TransferParam{
					From:   fromAccount.PublicKey,
					To:     common.PublicKeyFromString(to),
					Amount: lamports,
				}),
			},
		}),
	})
	if err != nil {
		log.Fatalf("failed to new a transaction, err: %v", err)
	}

	// send tx
	txhash, err := client.SendTransactionWithConfig(context.Background(), tx, solana.SendTransactionConfig{})
	if err != nil {
		log.Fatalf("failed to send tx, err: %v", err)
	}

	return &SendSolResult{
        TxnHash: txhash,
        Txn:     tx,
    }, nil

}

func WaitForConfirmation(client *solana.Client, txhash string) (*solana.Transaction, error) {
    for {
        // Check the transaction status
        txn, err := client.GetTransaction(context.Background(), txhash)
        if err != nil {
			log.Printf("failed to get tx, err: %v", err)
			return nil, err
        }

        if txn != nil {
            return txn, nil
        }

        time.Sleep(5 * time.Second)
    }
}

func GetTxn(hash string) (*solana.Transaction, error) {
	client := solana.NewClient(rpc.DevnetRPCEndpoint)
	txn, err := client.GetTransaction(context.Background(), hash)
	if err != nil {
		log.Printf("failed to get tx, err: %v", err)
		return nil, err
	}
	return txn, nil
}
