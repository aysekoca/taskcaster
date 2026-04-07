package users

import (
	"taskcaster/db"
	"taskcaster/res"

	"github.com/gofiber/fiber/v2"
)

func GetUsers(c *fiber.Ctx) error {
	users := make([]fiber.Map, 0)
	sql := "SELECT id, name, email, role FROM users"
	rows, err := db.DB.Query(sql)
	if err != nil {
		return res.DbErrorHandler(err, "", sql, c)
	}
	defer rows.Close()
	for rows.Next() {
		var (
			id    string
			name  string
			email string
			role  int
		)
		err = rows.Scan(&id, &name, &email, &role)
		if err != nil {
			return res.DbErrorHandler(err, "user", sql, c)
		}
		users = append(users, fiber.Map{
			"id":    id,
			"name":  name,
			"email": email,
			"role":  role,
		})
	}
	return res.ApiResponse(true, "Successfully fetched users", users, c)
}

func GetUser(c *fiber.Ctx) error {
	userId := c.Params("userId")
	var (
		id    string
		name  string
		email string
		role  int
	)
	sql := "SELECT id, name, email, role FROM users WHERE id = $1"
	err := db.DB.QueryRow(sql, userId).Scan(&id, &name, &email, &role)
	if err != nil {
		return res.DbErrorHandler(err, "", sql, c)
	}
	data := &fiber.Map{
		"id":    id,
		"name":  name,
		"email": email,
		"role":  role,
	}
	return res.ApiResponse(true, "Successfully fetched user", data, c)
}
