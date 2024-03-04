package routes

import (
	"encoding/json"
    "fmt"
	"net/http"

    "mote/src/types"
    "mote/src/sockets"
)



func SignHandler (w http.ResponseWriter, r *http.Request) {
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

    tx, err := sockets.SendSol(txnSignQuery.From, txnSignQuery.To, txnSignQuery.Amount)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    fmt.Println("hash:", tx.TxnHash)

    response := map[string]interface{}{
        "status":  "ok",
        "message": "Transaction signed successfully",
        "hash":     tx.TxnHash,
        "txn":     tx.Txn,
    }
    jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)

}

