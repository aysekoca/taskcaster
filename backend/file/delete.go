package file

import (
	"log"
	"os"
	"taskcaster/db"
	"taskcaster/res"

	"github.com/gofiber/fiber/v2"
)

func RemoveFile(c *fiber.Ctx) error {
	var userId = c.Locals("user_id").(string)
	var fileId = c.Params("id")

	var path string
	sql := `SELECT f.path 
			FROM file f, tasks t 
			WHERE f.task_id = t.id
			AND f.user_id = $1
			AND f.id = $2`
	err := db.DB.QueryRow(sql, userId, fileId).Scan(&path)
	if err != nil {
		return res.DbErrorHandler(err, "file", sql, c)
	}
	go func() {
		err := os.Remove(path)
		if err != nil {
			log.Println(err.Error())
		}
	}()

	sql = "DELETE FROM file WHERE id = $1"
	_, err = db.DB.Exec(sql, fileId)
	if err != nil {
		return res.DbErrorHandler(err, "file", sql, c)
	}

	return res.ApiResponse(true, "Successfully deleted the file", nil, c)
}

func RemoveFileAdmin(c *fiber.Ctx) error {
	var fileId = c.Params("id")

	var path string
	sql := `SELECT f.path 
			FROM file f, tasks t 
			WHERE f.task_id = t.id
			AND f.id = $1`
	err := db.DB.QueryRow(sql, fileId).Scan(&path)
	if err != nil {
		return res.DbErrorHandler(err, "file", sql, c)
	}
	go func() {
		err := os.Remove(path)
		if err != nil {
			log.Println(err.Error())
		}
	}()

	sql = "DELETE FROM file WHERE id = $1"
	_, err = db.DB.Exec(sql, fileId)
	if err != nil {
		return res.DbErrorHandler(err, "file", sql, c)
	}

	return res.ApiResponse(true, "Successfully deleted the file", nil, c)
}
