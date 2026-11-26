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

func defaultDBPath() string {
	// 优先使用项目根目录下的 backend/data，也兼容从 backend/ 目录直接运行的场景。
	for _, candidate := range []string{
		filepath.Join("backend", "data", "cheyi.db"),
		filepath.Join("data", "cheyi.db"),
	} {
		if _, err := os.Stat(filepath.Dir(candidate)); err == nil {
			return candidate
		}
	}
	return filepath.Join("backend", "data", "cheyi.db")
}

func Load() Config {
	port := getenv("PORT", "8080")
	dbPath := getenv("DB_PATH", defaultDBPath())
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
