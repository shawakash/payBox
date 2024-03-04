package sockets

import (
	"context"
	"fmt"
	"log"
	// "os"
	// "time"

	// "github.com/davecgh/go-spew/spew"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/programs/system"
	"github.com/gagliardetto/solana-go/rpc"
	confirm "github.com/gagliardetto/solana-go/rpc/sendAndConfirmTransaction"
	"github.com/gagliardetto/solana-go/rpc/ws"
	// "github.com/gagliardetto/solana-go/text"
	// "golang.org/x/time/rate"
)

type SendSolResult struct {
	TxnHash string
	Txn     solana.Transaction
}

func SendSol(from string, to string, amount float64, wait bool) (*solana.Transaction, error) {
	rpcClient := rpc.New(rpc.DevNet_RPC)

	wsClient, err := ws.Connect(context.Background(), rpc.DevNet_WS)
	if err != nil {
		panic(err)
	}

	accountFrom, err := solana.PrivateKeyFromBase58(from)
	if err != nil {
		panic(err)
	}

	accountTo := solana.MustPublicKeyFromBase58(to)
	lamports := uint64(amount * 1e9)
	log.Println("Transfering ", lamports, " lamports from ", accountFrom.PublicKey(), " to ", accountTo)

	// // Airdrop 1 sol to the account so it will have something to transfer:
	// if true {
	//   out, err := rpcClient.RequestAirdrop(
	// 	context.TODO(),
	// 	accountFrom.PublicKey(),
	// 	solana.LAMPORTS_PER_SOL*1,
	// 	rpc.CommitmentFinalized,
	//   )
	//   if err != nil {
	// 	panic(err)
	//   }
	//   fmt.Println("airdrop transaction signature:", out)
	//   time.Sleep(time.Second * 5)
	// }

	recent, err := rpcClient.GetRecentBlockhash(context.TODO(), rpc.CommitmentFinalized)
	if err != nil {
		panic(err)
	}

	tx, err := solana.NewTransaction(
		[]solana.Instruction{
			system.NewTransferInstruction(
				lamports,
				accountFrom.PublicKey(),
				accountTo,
			).Build(),
		},
		recent.Value.Blockhash,
		solana.TransactionPayer(accountFrom.PublicKey()),
	)
	if err != nil {
		panic(err)
	}

	_, err = tx.Sign(
		func(key solana.PublicKey) *solana.PrivateKey {
			if accountFrom.PublicKey().Equals(key) {
				return &accountFrom
			}
			return nil
		},
	)
	if err != nil {
		panic(fmt.Errorf("unable to sign transaction: %w", err))
	}

	// Send transaction, and wait for confirmation:
	if wait {
		sig, err := confirm.SendAndConfirmTransaction(
			context.Background(),
			rpcClient,
			wsClient,
			tx,
		)
		if err != nil {
			panic(err)
		}
		log.Println("hash: ", sig)
		return tx, nil
	} else {
		sig, err := rpcClient.SendTransactionWithOpts(
			context.TODO(),
			tx,
			rpc.TransactionOpts{
				PreflightCommitment: rpc.CommitmentFinalized,
			},
		)
		if err != nil {
			panic(err)
		}
		log.Println("hash: ", sig)
		return tx, nil
	}
}


// func WaitForConfirmation(client *solana.Client, txhash string) (*solana.Transaction, error) {
// 	for {
// 		// Check the transaction status
// 		txn, err := client.GetTransaction(context.Background(), txhash)
// 		if err != nil {
// 			log.Printf("failed to get tx, err: %v", err)
// 			return nil, err
// 		}

// 		if txn != nil {
// 			return txn, nil
// 		}

// 		time.Sleep(5 * time.Second)
// 	}
// }

// func GetTxn(hash string) (*solana.Transaction, error) {
// 	client := solana.NewClient(rpc.DevnetRPCEndpoint)
// 	txn, err := client.GetTransaction(context.Background(), hash)
// 	if err != nil {
// 		log.Printf("failed to get tx, err: %v", err)
// 		return nil, err
// 	}
// 	return txn, nil
// }
