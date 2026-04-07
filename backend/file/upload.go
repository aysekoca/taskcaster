package file

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"taskcaster/config"
	"taskcaster/db"
	"taskcaster/res"
	"time"

	"github.com/gabriel-vasile/mimetype"
	"github.com/gofiber/fiber/v2"
)

var cfg = config.Instance()
var MaxFileSizeBytes = cfg.FileSizeLimit * 1024 * 1024

func UploadAttachment(c *fiber.Ctx) error {
	var userId = c.Locals("user_id").(string)
	taskId := c.Params("taskId")

	var ownerCheck string
	sql := "SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND id = $2"
	err := db.DB.QueryRowContext(context.Background(), sql, userId, taskId).Scan(&ownerCheck)
	if err != nil {
		log.Println(err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not upload file!",
		})
	}
	if ownerCheck != "1" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Task with given ID not found!",
		})
	}

	fileHeader, err := c.FormFile("file")

	if err != nil {
		log.Println(err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not upload file!",
		})
	}

	if fileHeader.Size > MaxFileSizeBytes {
		return c.Status(fiber.StatusRequestEntityTooLarge).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("File is too big! Maximum Size: %dMB, Sent: %.2fMB", cfg.FileSizeLimit, float64(fileHeader.Size)/1024/1024),
		})
	}

	src, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not read the file!",
		})
	}
	defer src.Close()

	mime, err := mimetype.DetectReader(src)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not analyze the file type!",
		})
	}

	allowedMimes := map[string]bool{
		"image/jpeg":      true,
		"image/png":       true,
		"application/pdf": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":       true,
	}

	contentType := mime.String()

	if !allowedMimes[contentType] {
		return c.Status(fiber.StatusUnsupportedMediaType).JSON(fiber.Map{
			"success": false,
			"message": "Accepted file formats: PDF, DOCX, XLSX, JPEG and PNG",
		})
	}

	var filePath = filepath.Join(cfg.FileStoragePath, "notuploaded")
	var fileId string
	sql = "INSERT INTO file (user_id, task_id, name, path ,size, upload_date, mimetype) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id"
	err = db.DB.QueryRowContext(context.Background(), sql, userId, taskId, fileHeader.Filename, filePath, fileHeader.Size, time.Now().UTC(), contentType).Scan(&fileId)
	if err != nil {
		log.Println(err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not create file record, an unexpected error occured!",
		})
	}

	savePath := filepath.Join(cfg.FileStoragePath)
	os.MkdirAll(savePath, os.ModePerm)
	filePath = filepath.Join(savePath, filepath.Base(fileId))

	if err := c.SaveFile(fileHeader, filePath); err != nil {
		log.Println(err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not upload the file!",
		})
	}

	sql = "UPDATE file SET path = $1 WHERE id = $2"
	_, err = db.DB.Exec(sql, filePath, fileId)
	if err != nil {
		log.Println(err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not create file record!",
		})
	}

	data := fiber.Map{
		"taskId":       taskId,
		"id":           fileId,
		"fileName":     fileHeader.Filename,
		"size":         fileHeader.Size,
		"detectedType": contentType,
	}

	return res.ApiResponse(true, "File uploaded successfully!", data, c)
}

func UploadAttachmentAdmin(c *fiber.Ctx) error {
	userId := c.Locals("user_id").(string)
	taskId := c.Params("taskId")

	sql := "SELECT id FROM tasks WHERE id = $1"
	var placeholder string
	err := db.DB.QueryRowContext(context.Background(), sql, taskId).Scan(&placeholder)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}

	fileHeader, err := c.FormFile("file")

	if err != nil {
		return res.InternalErrorHandler(err, "Cannot get file from form!", c)
	}

	if fileHeader.Size > MaxFileSizeBytes {
		return res.ApiResponse(false, fmt.Sprintf("File is too big! Maximum Size: %dMB, Sent: %.2fMB", cfg.FileSizeLimit, float64(fileHeader.Size)/1024/1024), nil, c)
	}

	src, err := fileHeader.Open()
	if err != nil {
		return res.InternalErrorHandler(err, "Cannot open file!", c)
	}
	defer src.Close()

	mime, err := mimetype.DetectReader(src)
	if err != nil {
		return res.InternalErrorHandler(err, "Cannot analyze file content!", c)
	}

	allowedMimes := map[string]bool{
		"image/jpeg":      true,
		"image/png":       true,
		"application/pdf": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":       true,
	}

	contentType := mime.String()

	if !allowedMimes[contentType] {
		return c.Status(fiber.StatusUnsupportedMediaType).JSON(fiber.Map{
			"success": false,
			"message": "Accepted file formats: PDF, DOCX, XLSX, JPEG and PNG",
		})
	}

	var filePath = filepath.Join(cfg.FileStoragePath, "notuploaded")
	var fileId string
	sql = "INSERT INTO file (user_id, task_id, name, path ,size, upload_date, mimetype) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id"
	err = db.DB.QueryRowContext(context.Background(), sql, userId, taskId, fileHeader.Filename, filePath, fileHeader.Size, time.Now().UTC(), contentType).Scan(&fileId)
	if err != nil {
		return res.InternalErrorHandler(err, "Cannot create file record!", c)
	}

	savePath := filepath.Join(cfg.FileStoragePath)
	os.MkdirAll(savePath, os.ModePerm)
	filePath = filepath.Join(savePath, filepath.Base(fileId))

	if err := c.SaveFile(fileHeader, filePath); err != nil {
		return res.InternalErrorHandler(err, "Cannot save file", c)
	}

	sql = "UPDATE file SET path = $1 WHERE id = $2"
	_, err = db.DB.Exec(sql, filePath, fileId)
	if err != nil {
		res.InternalErrorHandler(err, "Cannot update file record!", c)
	}
	data := &fiber.Map{
		"taskId":       taskId,
		"id":           fileId,
		"fileName":     fileHeader.Filename,
		"size":         fileHeader.Size,
		"detectedType": contentType,
	}

	return res.ApiResponse(true, "Successfully uploaded the file", data, c)
}
