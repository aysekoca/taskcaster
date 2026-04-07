package db

import (
	"database/sql"
	"log"
	"strconv"
	"taskcaster/config"
)

var DB *sql.DB

func InitDB() error {
	cfg := config.Instance()
	var err error
	dsn := "host=" + cfg.DBHost + " user=" + cfg.DBUser + " password=" + cfg.DBPassword + " dbname=" + cfg.DBName + " port=" + strconv.Itoa(cfg.DBPort) + " sslmode=" + cfg.DBSslMode + ""
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Println("error while starting the psql server: ", err)
		return err
	}
	if err = DB.Ping(); err != nil {
		log.Println("error making a test ping to the server: ", err)
		return err
	}
	log.Println("Database connected successfully")
	return nil
}
