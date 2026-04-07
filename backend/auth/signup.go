package auth

import (
	"context"
	"errors"
	"taskcaster/db"
	"taskcaster/validator"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type (
	SignupPayload struct {
		Name     string `validate:"required,min=3,max=50"`
		Email    string `validate:"required,email,max=255"`
		Password string `validate:"required,min=8,max=255"`
	}
)

var (
	ErrEmailValidation = "users_email_key"
	ErrDuplicateEmail  = errors.New("e-posta adresi zaten mevcut")
	ErrValidation      = errors.New("veri doğrulama hatası")
	ErrConnection      = errors.New("veritabanı bağlantı hatası")
)

func Signup(c *fiber.Ctx) error {

	var payload SignupPayload
	if err := c.BodyParser(&payload); err != nil {
		return err
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": errMessage,
		})
	}

	if db.DB == nil {
		return c.Status(500).SendString("database connection is not initialized")
	}

	sql := "INSERT INTO users (name,email,password) VALUES ($1,$2,$3)"

	pASb := []byte(payload.Password)
	hp, bErr := bcrypt.GenerateFromPassword(pASb, 10)

	if bErr != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Hashing Error"})
	}
	_, err := db.DB.ExecContext(context.Background(), sql, payload.Name, payload.Email, string(hp))
	if err != nil {
		return c.Status(400).JSON(errorController(err))
	}

	return c.Status(201).JSON(fiber.Map{"success": true})
}
