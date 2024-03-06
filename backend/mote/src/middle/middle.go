package middle

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"mote/src/config"
	"mote/src/utils"
)

func CustomHeaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Custom-Header", "Hello from middleware!")
		next.ServeHTTP(w, r)
	})
}
func LoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.RequestURI != "/favicon.ico" {
            start := time.Now()

            next.ServeHTTP(w, r)

            fmt.Printf(
                "\n%s %s %s %s\n",
                r.Method,
                r.RequestURI,
                time.Since(start),
                r.RemoteAddr,
            )
        } else {
            next.ServeHTTP(w, r)
        }
	})
}

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", config.CLIENT_URL)
		w.Header().Set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func ResContentType(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

func ExtractClientId(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        var jwtStr string

        // Header takes precedence
        authHeader := r.Header.Get("Authorization")
        if authHeader != "" && strings.Split(authHeader, " ")[0] == "Bearer" {
			jwtStr = strings.Split(authHeader, " ")[1]
			log.Println(jwtStr)
        } else if cookie, err := r.Cookie("jwt"); err == nil {
            jwtStr = cookie.Value
        } else if jwtQuery := r.URL.Query().Get("jwt"); jwtQuery != "" {
            jwtStr = jwtQuery
        }

        if jwtStr != "" {
            _, claims, err := utils.ValidateJwt(jwtStr)
			if err != nil {
				http.Error(w, err.Error(), http.StatusForbidden)
			}
            ctx := context.WithValue(r.Context(), "id", claims.Subject)
            ctx = context.WithValue(ctx, "jwt", jwtStr)
            r = r.WithContext(ctx)
        } else {
            http.Error(w, "No authentication token found", http.StatusForbidden)
            return
        }

        next.ServeHTTP(w, r)
    })
}