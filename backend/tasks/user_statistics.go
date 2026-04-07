package tasks

import (
	"taskcaster/db"
	"taskcaster/res"

	"github.com/gofiber/fiber/v2"
)

// task count by category
// task

func GetUserStatistics(c *fiber.Ctx) error {
	userId := c.Locals("user_id").(string)
	var catStats = make([]fiber.Map, 0)
	var catIds = make([]string, 0)
	var catNames = make([]string, 0)
	var catColors = make([]string, 0)
	sql := `SELECT id, name, color FROM categories`
	rows, err := db.DB.Query(sql)
	if err != nil {
		return res.DbErrorHandler(err, "category", sql, c)
	}

	defer rows.Close()

	for rows.Next() {
		var catId string
		var catName string
		var catColor string
		err = rows.Scan(&catId, &catName, &catColor)
		if err != nil {
			return res.DbErrorHandler(err, "category", sql, c)
		}
		catIds = append(catIds, catId)
		catNames = append(catNames, catName)
		catColors = append(catColors, catColor)
	}

	for i := range len(catIds) {
		var completedCount int
		sql := `SELECT COUNT(*) FROM tasks 
			WHERE user_id = $1 AND category_id = $2 AND status = 'COMPLETED' `
		err := db.DB.QueryRow(sql, userId, catIds[i]).Scan(&completedCount)
		if err != nil {
			return res.DbErrorHandler(err, "task", sql, c)
		}

		var incompletedCount int
		sql = `SELECT COUNT(*) FROM tasks 
			WHERE user_id = $1 AND category_id = $2 AND NOT status = 'COMPLETED' `
		err = db.DB.QueryRow(sql, userId, catIds[i]).Scan(&incompletedCount)
		if err != nil {
			return res.DbErrorHandler(err, "task", sql, c)
		}
		catStats = append(catStats, fiber.Map{
			"categoryName":     catNames[i],
			"categoryId":       catIds[i],
			"completedCount":   completedCount,
			"incompletedCount": incompletedCount,
			"color":            catColors[i],
			"total":            incompletedCount + completedCount,
		})

	}
	var completedCount int
	sql = `SELECT COUNT(*) FROM tasks 
			WHERE user_id = $1 AND category_id IS NULL AND status = 'COMPLETED' `
	err = db.DB.QueryRow(sql, userId).Scan(&completedCount)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}

	var incompletedCount int
	sql = `SELECT COUNT(*) FROM tasks 
			WHERE user_id = $1 AND category_id IS NULL AND NOT status = 'COMPLETED' `
	err = db.DB.QueryRow(sql, userId).Scan(&incompletedCount)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}
	catStats = append(catStats, fiber.Map{
		"categoryName":     "none",
		"categoryId":       "none",
		"completedCount":   completedCount,
		"incompletedCount": incompletedCount,
		"color":            "",
		"total":            incompletedCount + completedCount,
	})
	return res.ApiResponse(true, "Successfully compiled statistics", &catStats, c)
}
