package auth

import (
	"context"
	"taskcaster/db"
	"taskcaster/token"
	"taskcaster/validator"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type (
	LoginPayload struct {
		Email    string `validate:"required,min=6,max=255"`
		Password string `validate:"required,min=8,max=255"`
	}
	LoginResult struct {
		Name  string
		Email string
	}
)

func Login(c *fiber.Ctx) error {
	var payload LoginPayload
	if err := c.BodyParser(&payload); err != nil {
		return err
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": errMessage,
		})
	}

	sql := `SELECT id,password,name,email,role FROM users WHERE email=$1 LIMIT 1`
	var hashedPassword string
	var result LoginResult
	var userId string
	var role int
	err := db.DB.QueryRowContext(context.Background(), sql, payload.Email).Scan(&userId, &hashedPassword, &result.Name, &result.Email, &role)
	if err != nil {
		return c.Status(400).JSON(errorController(err))
	}
	errB := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(payload.Password))
	if errB != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Wrong username or password"})
	}
	accessToken, refreshToken, errT := token.CreateDuo(userId)
	if errT != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": errT.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Successfully logged in",
		"access":  accessToken,
		"refresh": refreshToken,
		"name":    result.Name,
		"email":   result.Email,
		"role":    role,
	})
}
