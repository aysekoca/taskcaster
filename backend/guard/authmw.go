package guards

import (
	"context"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"taskcaster/db"
)

func AuthMW(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userId, ok := claims["UserId"].(string)
	if !ok {
		return c.SendStatus(fiber.StatusInternalServerError)

	}
	sql := `SELECT COUNT(*) count FROM users WHERE id=$1`

	var count string
	err := db.DB.QueryRowContext(context.Background(), sql, userId).Scan(&count)
	if err != nil || count != "1" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User does not exist",
		})
	}
	c.Locals("user_id", userId)
	return c.Next()
}
