package config

import (
	"os"
	"path/filepath"
)

type Config struct {
	Port      string
	DBPath    string
	JWTSecret string
	AppEnv    string
}

func Load() Config {
	port := getenv("PORT", "8080")
	dbPath := getenv("DB_PATH", filepath.Join("data", "cheyi.db"))
	if !filepath.IsAbs(dbPath) {
		if abs, err := filepath.Abs(dbPath); err == nil {
			dbPath = abs
		}
	}
	return Config{
		Port:      port,
		DBPath:    dbPath,
		JWTSecret: getenv("JWT_SECRET", "cheyi-local-secret-change-in-production"),
		AppEnv:    getenv("APP_ENV", "development"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
