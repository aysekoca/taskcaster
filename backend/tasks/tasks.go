package tasks

import (
	"context"
	"log"
	"taskcaster/db"
	"taskcaster/file"
	"taskcaster/res"
	"taskcaster/validator"

	sq "github.com/Masterminds/squirrel"
	govalidator "github.com/go-playground/validator/v10"

	"github.com/gofiber/fiber/v2"
)

type (
	CreateTaskPayload struct {
		Title       string  `validate:"required,min=1,max=50"`
		Description string  `validate:"omitempty,max=255"`
		CategoryId  *string `validate:"omitempty,uuid4"`
		DueDate     string  `validate:"required,datetime=2006-1-2"`
		DueTime     string  `validate:"required,datetime=15:04"`
		Status      string  `validate:"required,oneof=PENDING IN_PROGRESS COMPLETED CANCELED"`
	}

	UpdateTaskPayload struct {
		Title       string  `validate:"required,min=1,max=50"`
		Description string  `validate:"omitempty,max=255"`
		CategoryId  *string `validate:"omitempty,uuid4"`
		DueDate     string  `validate:"required,datetime=2006-1-2"`
		DueTime     string  `validate:"required,datetime=15:04"`
		Status      string  `validate:"required,oneof=PENDING IN_PROGRESS COMPLETED CANCELED"`
	}
)

func CreateUserTask(c *fiber.Ctx) error {
	var userId = c.Locals("user_id").(string)
	var payload CreateTaskPayload

	if err := c.BodyParser(&payload); err != nil {
		return res.ParsingErrorHandler(err, c)
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return res.ValidationErrorHandler(errMessage, c)
	}

	if payload.CategoryId != nil {
		sql := `SELECT id FROM categories WHERE id=$1`
		var placeholder string
		err := db.DB.QueryRow(sql, payload.CategoryId).Scan(&placeholder)

		if err != nil {
			return res.DbErrorHandler(err, "category", sql, c)
		}
	}
	columns := []string{"title", "status", "description", "due_time", "due_date", "user_id"}
	values := []interface{}{payload.Title, payload.Status, payload.Description, payload.DueTime, payload.DueDate, userId}
	if payload.CategoryId != nil {
		columns = append(columns, "category_id")
		values = append(values, *(payload.CategoryId))
	}

	sb := sq.Insert("tasks").Columns(columns...).Values(values...).
		Suffix("RETURNING id, title, description, status, category_id, due_date, due_time")

	var (
		id          string
		title       string
		description string
		status      string
		categoryId  *string
		dueDate     string
		dueTime     string
	)

	sqlQuery, args, err := sb.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return res.InternalErrorHandler(err, "Query building error!", c)
	}
	err = db.DB.QueryRowContext(context.Background(), sqlQuery, args...).
		Scan(&id, &title, &description, &status, &categoryId, &dueDate, &dueTime)
	if err != nil {
		return res.DbErrorHandler(err, "task", sqlQuery, c)
	}

	data := &fiber.Map{
		"id":          id,
		"title":       title,
		"description": description,
		"status":      status,
		"categoryId":  categoryId,
		"dueDate":     dueDate,
		"dueTime":     dueTime,
	}
	return res.ApiResponse(true, "Successfully added the task", data, c)
}

func UpdateUserTask(c *fiber.Ctx) error {
	var userId = c.Locals("user_id").(string)
	var payload UpdateTaskPayload
	var taskId = c.Params("id")

	if err := c.BodyParser(&payload); err != nil {
		return res.ParsingErrorHandler(err, c)
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return res.ValidationErrorHandler(errMessage, c)
	}

	sb := sq.Update("tasks").
		Set("title", payload.Title).
		Set("status", payload.Status).
		Set("due_date", payload.DueDate).
		Set("due_time", payload.DueTime).
		Set("description", payload.Description).
		Where(sq.Eq{"id": taskId}).
		Where(sq.Eq{"user_id": userId}).
		Suffix("RETURNING id, title, description, status, category_id, due_date, due_time")

	if payload.CategoryId != nil {
		sql := `SELECT id FROM categories WHERE id=$1`

		var placeHolder string
		err := db.DB.QueryRow(sql, payload.CategoryId).Scan(&placeHolder)

		if err != nil {
			return res.DbErrorHandler(err, "category", sql, c)
		}

		sb = sb.Set("category_id", *(payload.CategoryId))
	} else {
		sb = sb.Set("category_id", nil)
	}

	var (
		id          string
		title       string
		description string
		status      string
		categoryId  *string
		dueDate     string
		dueTime     string
	)

	sqlQuery, args, err := sb.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return res.InternalErrorHandler(err, "Query build error!", c)
	}
	err = db.DB.QueryRowContext(context.Background(), sqlQuery, args...).
		Scan(&id, &title, &description, &status, &categoryId, &dueDate, &dueTime)
	if err != nil {
		return res.DbErrorHandler(err, "category", sqlQuery, c)
	}

	data := &fiber.Map{
		"id":          id,
		"title":       title,
		"description": description,
		"status":      status,
		"categoryId":  categoryId,
		"dueDate":     dueDate,
		"dueTime":     dueTime,
	}
	return res.ApiResponse(true, "Successfully updated the task", data, c)
}

func DeleteUserTask(c *fiber.Ctx) error {
	var userId = c.Locals("user_id").(string)
	var taskId = c.Params("id")

	// Control if task is owned and exists
	sql := `SELECT id FROM tasks WHERE id = $1 AND user_id = $2`
	var placeholder string
	err := db.DB.QueryRow(sql, taskId, userId).Scan(&placeholder)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}

	fileIds := make([]string, 0)
	sql = "SELECT id FROM file WHERE task_id = $1"
	result, err := db.DB.Query(sql, taskId)
	if err != nil {
		return res.DbErrorHandler(err, "file", sql, c)
	}

	defer result.Close()

	for result.Next() {
		var fileId string
		err = result.Scan(&fileId)
		if err != nil {
			return res.DbErrorHandler(err, "file", sql, c)
		}
		fileIds = append(fileIds, fileId)
	}

	err = file.RemoveFiles(fileIds)
	if err != nil {
		res.InternalErrorHandler(err, "Cannot remove task files", c)
	}

	sql = `DELETE FROM tasks WHERE id=$1 AND user_id=$2`

	_, err = db.DB.Exec(sql, taskId, userId)

	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}

	data := &fiber.Map{
		"id": taskId,
	}
	return res.ApiResponse(true, "Successfully deleted the task", data, c)
}

type TaskQueryParams struct {
	Id           *string `query:"id" validate:"omitempty,uuid4"`
	StartTime    *string `query:"startTime" validate:"omitempty,datetime=15:04"`
	EndTime      *string `query:"endTime" validate:"omitempty,datetime=15:04"`
	StartDate    *string `query:"startDate" validate:"omitempty,datetime=2006-1-2"`
	EndDate      *string `query:"endDate" validate:"omitempty,datetime=2006-1-2"`
	Status       *string `query:"status" validate:"omitempty,oneof=PENDING IN_PROGRESS COMPLETED CANCELED"`
	CategoryId   *string `query:"categoryId" validate:"omitempty,uuid4"`
	WithCategory *string `query:"withCategory" validate:"omitempty,oneof=false"`
}

func GetUserTasks(c *fiber.Ctx) error {
	var userId = c.Locals("user_id").(string)

	validate := govalidator.New()

	params := new(TaskQueryParams)

	if err := c.QueryParser(params); err != nil {
		return res.ParsingErrorHandler(err, c)
	}

	if err := validate.Struct(params); err != nil {
		return res.ValidationErrorHandler(err.Error(), c)
	}

	sb := sq.Select("id", "title", "description", "status", "category_id", "due_date", "due_time").
		From("tasks").
		Where(sq.Eq{"user_id": userId}).
		OrderBy("due_date DESC", "due_time DESC")

	if params.Id != nil {
		sb = sb.Where(sq.Eq{"id": params.Id})
	}
	if params.StartTime != nil {
		sb = sb.Where(sq.GtOrEq{"due_time": params.StartTime})
	}
	if params.EndTime != nil {
		sb = sb.Where(sq.LtOrEq{"due_time": params.EndTime})
	}
	if params.StartDate != nil {
		sb = sb.Where(sq.GtOrEq{"due_date": params.StartDate})
	}
	if params.EndDate != nil {
		sb = sb.Where(sq.LtOrEq{"due_date": params.EndDate})
	}
	if params.Status != nil {
		sb = sb.Where(sq.Eq{"status": params.Status})
	}
	if params.CategoryId != nil {
		sb = sb.Where(sq.Eq{"category_id": params.CategoryId})
	}
	if params.WithCategory != nil {
		sb = sb.Where(sq.Eq{"category_id": nil})
	}

	sqlQuery, args, err := sb.PlaceholderFormat(sq.Dollar).ToSql()

	if err != nil {
		log.Println(err.Error())
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "An unexpected error occured when fetching tasks!",
		})
	}

	rows, err := db.DB.Query(sqlQuery, args...)

	if err != nil {
		log.Println(err.Error())
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "An unexpected error occured when fetching tasks!",
		})
	}

	defer rows.Close()

	var tasks []fiber.Map
	for rows.Next() {
		var (
			id          string
			title       string
			description string
			status      string
			categoryId  *string
			dueDate     string
			dueTime     string
		)
		err = rows.Scan(&id, &title, &description, &status, &categoryId, &dueDate, &dueTime)
		if err != nil {
			log.Println(err.Error())
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		}
		tasks = append(tasks, fiber.Map{
			"id":          id,
			"title":       title,
			"description": description,
			"status":      status,
			"categoryId":  categoryId,
			"dueDate":     dueDate,
			"dueTime":     dueTime,
		})
	}
	return res.ApiResponse(true, "Successfully fetched tasks", &tasks, c)
}

func GetUserTaskDetails(c *fiber.Ctx) error {
	taskId := c.Params("id")
	var (
		id          string
		title       string
		description string
		category_id *string
		status      string
		due_date    string
		due_time    string
		files       []fiber.Map
	)

	sql := `SELECT id, title, description, category_id, 
						status, due_date, due_time
						FROM tasks WHERE id = $1 AND user_id = $2`

	err := db.DB.QueryRow(sql, taskId, c.Locals("user_id")).Scan(&id, &title, &description, &category_id, &status, &due_date, &due_time)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}

	sql = `SELECT id, name, task_id, size, upload_date, mimetype
						FROM file WHERE task_id = $1`

	rows, err := db.DB.Query(sql, taskId)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}
	defer rows.Close()
	for rows.Next() {
		var (
			id          string
			name        string
			task_id     string
			size        string
			upload_date string
			mimetype    string
		)
		err = rows.Scan(&id, &name, &task_id, &size, &upload_date, &mimetype)
		if err != nil {
			return res.DbErrorHandler(err, "task", sql, c)
		}
		files = append(files, fiber.Map{
			"id":         id,
			"name":       name,
			"taskId":     task_id,
			"size":       size,
			"uploadDate": upload_date,
			"mimetype":   mimetype,
		})
	}

	data := &fiber.Map{
		"id":          id,
		"title":       title,
		"description": description,
		"categoryId":  category_id,
		"status":      status,
		"dueDate":     due_date,
		"dueTime":     due_time,
		"files":       files,
	}

	return res.ApiResponse(true, "Successfully fethed tasks", data, c)
}
