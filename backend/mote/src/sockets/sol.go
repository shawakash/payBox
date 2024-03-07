package sockets

import (
	"context"
	"math/big"
	"strings"
	"time"

	// "encoding/json"
	"fmt"
	"log"

	// "os"
	// "time"

	"mote/src/types"
	"mote/src/utils"

	bin "github.com/gagliardetto/binary"
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

func SendSol(from string, to string, amount float64, wait bool) (*types.Txn, error) {
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
	}
	txn, _ := GetSolTxn(tx.Signatures[0].String())
	log.Println("txn: ", txn)

	utils.PublishTxn(*txn)

	return txn, nil
}

func GetSolTxn(hash string) (*types.Txn, error) {
	client := rpc.New(rpc.DevNet_RPC)
	sig := solana.MustSignatureFromBase58(hash)
	tx, err := client.GetTransaction(
		context.Background(),
		sig,
		&rpc.GetTransactionOpts{
			Encoding: solana.EncodingBase64,
		},
	)
	if err != nil {
		panic(err)
	}

	log.Println("tx: ", tx)

    decodedTx, err := solana.TransactionFromDecoder(bin.NewBinDecoder(tx.Transaction.GetBinary()))
    if err != nil {
      panic(err)
    }
	
	var txn = &types.Txn{
		Hash:      string(decodedTx.Signatures[0].String()),
		Network:   "sol",
		Cluster:   "devnet",
		Timestamp: time.Unix(tx.BlockTime.Time().Unix(), 0),
		Slot:      tx.Slot,
		From:      string(decodedTx.Message.AccountKeys[0].String()),
		To:        string(decodedTx.Message.AccountKeys[1].String()),
		BlockHash: decodedTx.Message.RecentBlockhash.String(),
		Amt:       float64(tx.Meta.PostBalances[0] - tx.Meta.PreBalances[0]) / 1e9,
		Fee:       float64(tx.Meta.Fee) / 1e9,
		Status:    string("confirmed"),
		ClientId:  "71cc7ca9-6072-4571-99c6-a595132fba2f",
		ChainId:   big.NewInt(103),
	}

	if txn.To == strings.Repeat("1", 32) {
		txn.To = txn.From
	}

	if err != nil {
		log.Printf("failed to get tx, err: %v", err)
		return nil, err
	}
	return txn, nil
}
