package category

import (
	"context"
	"taskcaster/db"
	"taskcaster/res"
	"taskcaster/validator"

	"github.com/gofiber/fiber/v2"
)

type (
	CreateCategoryPayload struct {
		Name  string `validate:"required,min=1,max=255"`
		Color string `validate:"required,len=7"`
	}
	UpdateCategoryPayload struct {
		Color string `validate:"required,len=7"`
		Name  string `validate:"required,min=1,max=255"`
	}
)

func CreateCategory(c *fiber.Ctx) error {
	var payload CreateCategoryPayload

	if err := c.BodyParser(&payload); err != nil {
		return err
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return res.ApiResponse(false, errMessage, nil, c)
	}

	var count string
	sql := `SELECT count(*) FROM categories WHERE name=$1`
	err := db.DB.QueryRowContext(context.Background(), sql, payload.Name).Scan(&count)
	if err != nil || count != "0" {
		return res.ApiResponse(false, "Category with this name already exists!", nil, c)
	}

	var categoryId string
	sql = "INSERT INTO categories (name,color) VALUES ($1,$2) RETURNING id"
	err = db.DB.QueryRowContext(context.Background(), sql, payload.Name, payload.Color).Scan(&categoryId)
	if err != nil {
		return res.DbErrorHandler(err, "category", sql, c)
	}
	data := &fiber.Map{
		"id": categoryId,
	}
	return res.ApiResponse(true, "Successfully added the task", data, c)
}

func UpdateCategory(c *fiber.Ctx) error {
	var payload UpdateCategoryPayload
	var categoryId = c.Params("id")

	if err := c.BodyParser(&payload); err != nil {
		return res.ParsingErrorHandler(err, c)
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return res.ValidationErrorHandler(errMessage, c)
	}

	sql := `SELECT id FROM categories WHERE id=$1`
	var placeholder string
	err := db.DB.QueryRow(sql, categoryId).Scan(&placeholder)
	if err != nil {
		return res.DbErrorHandler(err, "category", sql, c)
	}

	var count string
	sql = `SELECT count(*) FROM categories WHERE name=$1 AND NOT id=$2`
	err = db.DB.QueryRowContext(context.Background(), sql, payload.Name, categoryId).Scan(&count)

	if err != nil {
		return res.DbErrorHandler(err, "category", sql, c)
	}
	sql = "UPDATE categories SET name=$1, color=$2 WHERE id=$3"
	_, err = db.DB.QueryContext(context.Background(), sql, payload.Name, payload.Color, categoryId)
	if err != nil {
		return res.DbErrorHandler(err, "category", sql, c)
	}
	data := &fiber.Map{
		"id": categoryId,
	}
	return res.ApiResponse(true, "Successfully updated the category", data, c)
}

func GetCategories(c *fiber.Ctx) error {
	sql := `SELECT id, name, color FROM categories`
	rows, err := db.DB.Query(sql)
	if err != nil {
		return res.DbErrorHandler(err, "category", sql, c)
	}
	defer rows.Close()

	var categories []fiber.Map
	for rows.Next() {
		var (
			id    string
			name  string
			color string
		)
		err = rows.Scan(&id, &name, &color)
		if err != nil {
			return res.DbErrorHandler(err, "category", sql, c)
		}
		categories = append(categories, fiber.Map{
			"id":    id,
			"name":  name,
			"color": color,
		})
	}

	data := &fiber.Map{
		"categories": categories,
		"count":      len(categories),
	}
	return res.ApiResponse(true, "Successfully fetched categories", data, c)

}

func DeleteCategory(c *fiber.Ctx) error {
	var categoryId = c.Params("id")

	sql := `DELETE FROM categories WHERE id=$1`
	_, err := db.DB.Exec(sql, categoryId)
	if err != nil {
		return res.DbErrorHandler(err, "category", sql, c)
	}
	data := &fiber.Map{
		"id": categoryId,
	}
	return res.ApiResponse(true, "Successfully deleted the task", data, c)
}
