package auth

import (
	"context"
	"taskcaster/db"
	"taskcaster/token"
	"taskcaster/validator"

	"github.com/gofiber/fiber/v2"
)

type (
	RefreshPayload struct {
		Token string `validate:"required"`
	}

	RefreshResult struct {
		Name  string
		Email string
		Role  string
	}
)

func Refresh(c *fiber.Ctx) error {
	var payload RefreshPayload
	if errPayload := c.BodyParser(&payload); errPayload != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Token not founded"})
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": errMessage,
		})
	}

	tokenClaim, err := token.VerifyToken(payload.Token, false)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "message": "Invalid token"})
	} else {
		var result RefreshResult
		sql := `SELECT name,email,role FROM users WHERE id=$1`
		errSql := db.DB.QueryRowContext(context.Background(), sql, tokenClaim.UserId).Scan(&result.Name, &result.Email, &result.Role)
		if errSql != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "User not founded"})
		}
		acessToken, refreshToken, errNewToken := token.CreateDuo(tokenClaim.UserId)
		if errNewToken != nil {
			return c.Status(500).JSON(fiber.Map{"success": false, "message": "Token cannot created"})
		} else {
			return c.Status(200).JSON(fiber.Map{
				"success": true,
				"access":  acessToken,
				"refresh": refreshToken,
				"name":    result.Name,
				"email":   result.Email,
				"role":    result.Role})
		}
	}

}
