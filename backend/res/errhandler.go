package res

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
)

func DbErrorHandler(err error, entity string, sqlstr string, c *fiber.Ctx) error {
	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("Not found: %s", entity),
		})
	}
	log.Printf("[DB ERROR] Query: (%s) Description: %s", sqlstr, err.Error())
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
		"success": false,
		"message": fmt.Sprintf("An unexpected error occurred when processing %s", entity),
	})
}

func InternalErrorHandler(err error, msg string, c *fiber.Ctx) error {
	log.Printf("[INTERNAL ERROR] Description: %s", msg)
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
		"success": false,
		"message": fmt.Sprintf("An unexpected error occurred: %s", msg),
	})
}

func ParsingErrorHandler(err error, c *fiber.Ctx) error {
	return ApiResponse(false, fmt.Sprintf("Parsing Error: %s", err.Error()), nil, c)
}
func ValidationErrorHandler(errMsg string, c *fiber.Ctx) error {
	return ApiResponse(false, fmt.Sprintf("Validation Error: %s", errMsg), nil, c)
}
