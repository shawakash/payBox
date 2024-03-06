package config

import (
	"github.com/joho/godotenv"
	"log"
	"os"
)

var (
    SEPOLIA_URL = ""
	INFURA_PROJECT_ID = ""
	SEPOLIA_URL_HTTP = "https://sepolia.infura.io/v3/"
	REDIS_SECRET = ""
	REDIS_URL = "redis://localhost:6379"
    INFURA_SEPOLIA_URL = ""
    BTC_RPC_USER = "user"
    BTC_RPC_PASS = "pass"
    BTC_RPC_HOST = "localhost:8332"
    BTC_RPC_PORT = "8332"
    BTC_POST_MODE = true
)

const (
	CLIENT_URL = "http://localhost:3000"
	PORT = 8085
)


func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

    if ENV_SEPOLIA_URL := os.Getenv("SEPOLIA_URL"); ENV_SEPOLIA_URL != "" {
        SEPOLIA_URL = ENV_SEPOLIA_URL
    }
    if ENV_INFURA_PROJECT_ID := os.Getenv("INFURA_PROJECT_ID"); ENV_INFURA_PROJECT_ID != "" {
        INFURA_PROJECT_ID = ENV_INFURA_PROJECT_ID
    }
    if ENV_SEPOLIA_URL_HTTP := os.Getenv("SEPOLIA_URL_HTTP"); ENV_SEPOLIA_URL_HTTP != "" {
        SEPOLIA_URL_HTTP = ENV_SEPOLIA_URL_HTTP
        INFURA_SEPOLIA_URL = SEPOLIA_URL_HTTP + INFURA_PROJECT_ID
    }
    if ENV_REDIS_SECRET := os.Getenv("REDIS_SECRET"); ENV_REDIS_SECRET != "" {
        REDIS_SECRET = ENV_REDIS_SECRET
    }
    if ENV_REDIS_URL := os.Getenv("REDIS_URL"); ENV_REDIS_URL != "" {
        REDIS_URL = ENV_REDIS_URL
    }
    if ENV_BTC_RPC_USER := os.Getenv("BTC_RPC_USER"); ENV_BTC_RPC_USER != "" {
        BTC_RPC_USER = ENV_BTC_RPC_USER
    }
    if ENV_BTC_RPC_PASS := os.Getenv("BTC_RPC_PASS"); ENV_BTC_RPC_PASS != "" {
        BTC_RPC_PASS = ENV_BTC_RPC_PASS
    }
    if ENV_BTC_RPC_HOST := os.Getenv("BTC_RPC_HOST"); ENV_BTC_RPC_HOST != "" {
        BTC_RPC_HOST = ENV_BTC_RPC_HOST
    }
    if ENV_BTC_RPC_PORT := os.Getenv("BTC_RPC_PORT"); ENV_BTC_RPC_PORT != "" {
        BTC_RPC_PORT = ENV_BTC_RPC_PORT
    }
}
