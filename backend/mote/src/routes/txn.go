package routes

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"mote/src/sockets"
	"mote/src/types"

	"github.com/go-playground/validator/v10"
)

func SignHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered from panic:", r)
		}
	}()
	var txnSignQuery types.TxnSign

	if err := json.NewDecoder(r.Body).Decode(&txnSignQuery); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := sockets.SendSol(txnSignQuery.From, txnSignQuery.To, txnSignQuery.Amount, txnSignQuery.Wait)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("hash:", tx.Signatures[0])

	response := map[string]interface{}{
		"status":  "ok",
		"message": "Transaction signed successfully",
		"hash":    tx.Signatures[0],
		"txn":     tx,
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)

}

func GetTransactionHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered from panic:", r)
		}
	}()
	query := r.URL.Query()

	hash := query.Get("hash")

	queryParams := types.TxnGet{
		Hash: hash,
	}

	validate := validator.New()

	if err := validate.Struct(queryParams); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	txn, err := sockets.GetTxn(hash)
	if err != nil {
		http.Error(w, "Transaction not found", http.StatusNotFound)
		return
	}

	log.Println("txn: ", txn);

	response := map[string]interface{}{
		"status":  "ok",
		"message": "Transaction found",
		"txn":     txn,
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
}
