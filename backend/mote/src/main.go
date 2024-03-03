package main


import (
	"encoding/json"
	"fmt"
	"mote/src/config"
	"mote/src/middle"
	"net/http"
	"strconv"
	"time"
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

	mux := http.NewServeMux()

	mux.Handle("/", middle.LoggerMiddleware(middle.ResContentType(http.HandlerFunc(MainHandler))))
	mux.Handle("/_health", middle.LoggerMiddleware(middle.ResContentType(http.HandlerFunc(HealthCheckHandler))))

	fmt.Println("Server started on port ", address)
	http.ListenAndServe(address, mux)
}
