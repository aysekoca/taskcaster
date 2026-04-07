package file

import (
	"taskcaster/db"
	"taskcaster/res"

	"github.com/gofiber/fiber/v2"
)

func DownloadAttachment(c *fiber.Ctx) error {
	var userId = c.Locals("user_id").(string)
	var fileId = c.Params("id")

	var (
		filePath string
		fileName string
		mimetype string
	)
	sql := `SELECT f.path, f.name, f.mimetype 
		   FROM file f, tasks t 
		   WHERE 
		   f.task_id = t.id AND
		   t.user_id = $1 AND
		   f.id = $2`
	err := db.DB.QueryRow(sql, userId, fileId).Scan(&filePath, &fileName, &mimetype)
	if err != nil {
		return res.DbErrorHandler(err, "file", sql, c)
	}

	c.Set("Content-Type", mimetype)
	return c.Status(fiber.StatusOK).Download(filePath, fileName)
}

func DownloadAttachmentAdmin(c *fiber.Ctx) error {
	var fileId = c.Params("id")

	var (
		filePath string
		fileName string
		mimetype string
	)
	sql := `SELECT path, name, mimetype 
		    FROM file 
		   	WHERE id = $1`
	err := db.DB.QueryRow(sql, fileId).Scan(&filePath, &fileName, &mimetype)
	if err != nil {
		return res.DbErrorHandler(err, "file", sql, c)
	}

	c.Set("Content-Type", mimetype)
	return c.Status(fiber.StatusOK).Download(filePath, fileName)
}
