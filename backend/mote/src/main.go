package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"mote/src/config"
	"mote/src/middle"
	"mote/src/routes"

	"github.com/gorilla/mux"
)

func MainHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"uptime":    time.Since(startTime).Seconds(),
		"message":   "OK",
		"timestamp": time.Now().UnixNano() / int64(time.Millisecond),
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
}

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"uptime":    time.Since(startTime).Seconds(),
		"message":   "OK",
		"timestamp": time.Now().UnixNano() / int64(time.Millisecond),
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
}

var startTime time.Time

func main() {
	startTime = time.Now()
	address := ":" + strconv.Itoa(config.PORT)
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Caught panic: ", r)
		}
	}()

	app := mux.NewRouter()

	// Middlewares
	app.Use(middle.LoggerMiddleware)
	app.Use(middle.CorsMiddleware)
	app.Use(middle.ResContentType)

	app.HandleFunc("/", MainHandler).Methods("GET")
	app.HandleFunc("/_health", HealthCheckHandler).Methods("GET")

	// Routers
	txnRouter := app.PathPrefix("/txn").Subrouter()

	txnRouter.HandleFunc("/send", routes.SignHandler).Methods("POST")
	
	fmt.Println("Server started on port ", address)
	http.ListenAndServe(address, app)
}
