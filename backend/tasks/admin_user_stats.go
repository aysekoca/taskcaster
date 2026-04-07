package tasks

import (
	"taskcaster/db"
	"taskcaster/res"

	"github.com/gofiber/fiber/v2"
)

// task count by category
// task

func GetAdminUserStatistics(c *fiber.Ctx) error {
	userId := c.Params("userId")
	c.Locals("user_id", userId)
	var placeholder string
	sql := "SELECT id FROM users WHERE id=$1"
	err := db.DB.QueryRow(sql, userId).Scan(&placeholder)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}
	return GetUserStatistics(c)
}
