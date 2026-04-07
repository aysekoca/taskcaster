package users

import (
	"context"
	"errors"
	"taskcaster/db"
	"taskcaster/res"
	"taskcaster/validator"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type (
	CreateUserPayload struct {
		Email    string `validate:"required,email,max=255"`
		Password string `validate:"required,min=8,max=255"`
		Role     string `validate:"required,oneof=0 1"`
		Name     string `validate:"required,min=3,max=50"`
	}
)

var (
	ErrEmailValidation = "users_email_key"
	ErrDuplicateEmail  = errors.New("e-posta adresi zaten mevcut")
	ErrValidation      = errors.New("veri doğrulama hatası")
	ErrConnection      = errors.New("veritabanı bağlantı hatası")
)

func CreateUser(c *fiber.Ctx) error {

	var payload CreateUserPayload
	if err := c.BodyParser(&payload); err != nil {
		return res.ParsingErrorHandler(err, c)
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return res.ValidationErrorHandler(errMessage, c)
	}

	sql := "INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4)"

	pASb := []byte(payload.Password)
	hp, bErr := bcrypt.GenerateFromPassword(pASb, 10)

	if bErr != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Hashing Error"})
	}
	_, err := db.DB.QueryContext(context.Background(), sql, payload.Name, payload.Email, string(hp), payload.Role)
	if err != nil {
		return c.Status(400).JSON(errorController(err))
	}

	return c.Status(201).JSON(fiber.Map{"success": true})
}
