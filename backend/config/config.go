package config

import (
	"log"
	"os"
	"strconv"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string
	DBSslMode  string

	Port   int
	Domain string

	JWTAccessKey  string
	JWTRefreshKey string
	JWTAccessExp  string
	JWTRefreshExp string

	SMTPHost     string
	SMTPPassword string
	SMTPUser     string
	SMTPPort     int

	FileStoragePath string
	FileSizeLimit   int64
}

var (
	instance *Config
	once     sync.Once
	envPath  string = ".env"
)

func SetEnvFile(path string) {
	loadEnvFile(path)
	envPath = path
}

func loadEnvFile(envFile string) {
	if err := godotenv.Load(envFile); err != nil {
		log.Printf("Warning: %s file was not found.", envFile)
	}

	instance = &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnvAsInt("DB_PORT", 5432),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "taskcaster_db"),
		DBSslMode:  getEnv("DB_SSL_MODE", "false"),
		Port:       getEnvAsInt("PORT", 3001),
		Domain:     getEnv("DOMAIN", "127.0.0.1:3001"),

		JWTAccessKey:  getEnv("JWT_ACCESS_SECRET_KEY", "default_secret"),
		JWTAccessExp:  getEnv("JWT_ACCESS_EXP", "15m"),
		JWTRefreshKey: getEnv("JWT_ACCESS_REFRESH_KEY", "d3fault_s3cr3t"),
		JWTRefreshExp: getEnv("JWT_REFRESH_EXP", "7d"),

		SMTPHost:     getEnv("SMTP_HOST", "smtp.google.com"),
		SMTPPassword: getEnv("SMTP_HOST_PASSWORD", ""),
		SMTPUser:     getEnv("SMTP_HOST_USER", ""),
		SMTPPort:     getEnvAsInt("SMTP_PORT", 465),

		FileStoragePath: getEnv("FILE_STORAGE_PATH", "./uploaded_files"),
		FileSizeLimit:   getEnvAsInt64("FILE_SIZE_LIMIT", 10),
	}
}

func Instance() *Config {
	if instance == nil {
		SetEnvFile(".env")
	}
	return instance
}

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
func getEnvAsInt(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	intval, err := strconv.Atoi(val)
	if err != nil {
		return fallback
	}
	return int(intval)
}

func getEnvAsInt64(key string, fallback int64) int64 {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	intval, err := strconv.Atoi(val)
	if err != nil {
		return fallback
	}
	return int64(intval)
}

func loadEnv() {
	errEnv := godotenv.Load(".env")
	if errEnv != nil {
		log.Fatal("Error loading .env file")
	}
}
