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
    }
    if ENV_REDIS_SECRET := os.Getenv("REDIS_SECRET"); ENV_REDIS_SECRET != "" {
        REDIS_SECRET = ENV_REDIS_SECRET
    }
    if ENV_REDIS_URL := os.Getenv("REDIS_URL"); ENV_REDIS_URL != "" {
        REDIS_URL = ENV_REDIS_URL
    }
}
