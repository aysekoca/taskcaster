package users

import (
	"taskcaster/db"
	"taskcaster/res"

	"github.com/gofiber/fiber/v2"
)

func DeleteUser(c *fiber.Ctx) error {
	adminUserId := c.Locals("user_id")
	userId := c.Params("userId")

	var placeholder string
	sql := "SELECT id FROM users WHERE id=$1"
	err := db.DB.QueryRow(sql, userId).Scan(&placeholder)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}

	sql = "UPDATE tasks SET user_id=$1 WHERE user_id=$2"
	_, err = db.DB.Exec(sql, adminUserId, userId)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}

	sql = "UPDATE file SET user_id=$1 WHERE user_id=$2"
	_, err = db.DB.Exec(sql, adminUserId, userId)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}

	sql = "DELETE FROM users WHERE id=$1"
	_, err = db.DB.Exec(sql, userId)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}

	return res.ApiResponse(true, "Successfully deleted user", nil, c)
}
