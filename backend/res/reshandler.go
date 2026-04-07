package res

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

func ApiResponse(success bool, msg string, data interface{}, c *fiber.Ctx) error {
	var status int
	if success {
		status = fiber.StatusOK
	} else {
		status = fiber.StatusBadRequest
	}
	return c.Status(status).JSON(fiber.Map{
		"success": success,
		"message": msg,
		"data":    data,
		"time":    time.Now().String(),
	})
}
