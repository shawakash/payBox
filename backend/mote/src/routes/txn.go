package routes

import (
	"encoding/json"
    "fmt"
	"net/http"

    "mote/src/types"
)



func SignHandler (w http.ResponseWriter, r *http.Request) {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from panic:", r)
        }
    }()
    var txnSignQuery types.TxnSign
    // queryParams := r.URL.Query()

    // from := queryParams.Get("from")
    // to := queryParams.Get("to")
    // amount := queryParams.Get("amount")
    // network := queryParams.Get("network")
    // cluster := queryParams.Get("cluster")

    // if from == "" || to == "" || amount == "" || network == "" || cluster == "" {
    //     http.Error(w, "Missing required query parameters", http.StatusBadRequest)
    //     return
    // }

    if err := json.NewDecoder(r.Body).Decode(&txnSignQuery); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

    fmt.Println("Received request to sign transaction:", txnSignQuery.From)

    response := map[string]interface{}{
        "status":  "ok",
        "message": "Transaction signed successfully",
    }
    jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)

}

