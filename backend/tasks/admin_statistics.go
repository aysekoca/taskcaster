package tasks

import (
	"taskcaster/db"
	"taskcaster/res"

	"github.com/gofiber/fiber/v2"
)

// task count by category
// task

func GetAdminStatistics(c *fiber.Ctx) error {
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
			WHERE category_id = $1 AND status = 'COMPLETED' `
		err := db.DB.QueryRow(sql, catIds[i]).Scan(&completedCount)
		if err != nil {
			return res.DbErrorHandler(err, "task", sql, c)
		}

		var incompletedCount int
		sql = `SELECT COUNT(*) FROM tasks 
			WHERE category_id = $1 AND NOT status = 'COMPLETED' `
		err = db.DB.QueryRow(sql, catIds[i]).Scan(&incompletedCount)
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
			WHERE category_id IS NULL AND status = 'COMPLETED' `
	err = db.DB.QueryRow(sql).Scan(&completedCount)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}

	var incompletedCount int
	sql = `SELECT COUNT(*) FROM tasks 
			WHERE category_id IS NULL AND NOT status = 'COMPLETED' `
	err = db.DB.QueryRow(sql).Scan(&incompletedCount)
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

	var userCount int
	sql = "SELECT COUNT(*) FROM users"
	err = db.DB.QueryRow(sql).Scan(&userCount)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}

	var completedTaskCount int
	sql = "SELECT COUNT(*) FROM tasks WHERE status = 'COMPLETED'"
	err = db.DB.QueryRow(sql).Scan(&completedTaskCount)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}

	var incompletedTaskCount int
	sql = "SELECT COUNT(*) FROM tasks WHERE NOT status = 'COMPLETED'"
	err = db.DB.QueryRow(sql).Scan(&incompletedTaskCount)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}
	data := &fiber.Map{
		"userCount":            userCount,
		"incompletedTaskCount": incompletedTaskCount,
		"completedTaskCount":   completedTaskCount,
		"totalTaskCount":       incompletedTaskCount + completedTaskCount,
		"catStats":             catStats,
	}

	return res.ApiResponse(true, "Successfully compiled statistics", data, c)
}
