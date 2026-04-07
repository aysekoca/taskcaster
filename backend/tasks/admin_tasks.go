package tasks

import (
	"context"
	"fmt"
	"taskcaster/db"
	"taskcaster/file"
	"taskcaster/res"
	"taskcaster/validator"

	sq "github.com/Masterminds/squirrel"
	govalidator "github.com/go-playground/validator/v10"

	"github.com/gofiber/fiber/v2"
)

type (
	CreateTaskPayloadAdmin struct {
		Title       string  `validate:"required,min=1,max=50"`
		Description string  `validate:"omitempty,max=255"`
		CategoryId  *string `validate:"omitempty,uuid4"`
		DueDate     string  `validate:"required,datetime=2006-1-2"`
		DueTime     string  `validate:"required,datetime=15:04"`
		Status      string  `validate:"required,oneof=PENDING IN_PROGRESS COMPLETED CANCELED"`
		UserId      string  `validate:"required,uuid4"`
	}
	UpdateTaskPayloadAdmin struct {
		Title       string  `validate:"required,min=1,max=50"`
		Description string  `validate:"omitempty,max=255"`
		CategoryId  *string `validate:"omitempty,uuid4"`
		DueDate     string  `validate:"required,datetime=2006-1-2"`
		DueTime     string  `validate:"required,datetime=15:04"`
		Status      string  `validate:"required,oneof=PENDING IN_PROGRESS COMPLETED CANCELED"`
		UserId      string  `validate:"required,uuid4"`
	}
)

func CreateTaskAdmin(c *fiber.Ctx) error {
	var payload CreateTaskPayloadAdmin

	if err := c.BodyParser(&payload); err != nil {
		return res.ParsingErrorHandler(err, c)
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return res.ValidationErrorHandler(errMessage, c)
	}
	if payload.CategoryId != nil {
		sql := `SELECT id FROM categories WHERE id=$1`
		var placeholder string
		err := db.DB.QueryRowContext(context.Background(), sql, payload.CategoryId).Scan(&placeholder)

		if err != nil {
			return res.DbErrorHandler(err, "category", sql, c)
		}
	}
	columns := []string{"title", "status", "description", "due_time", "due_date", "user_id"}
	values := []interface{}{payload.Title, payload.Status, payload.Description, payload.DueTime, payload.DueDate, payload.UserId}
	if payload.CategoryId != nil {
		columns = append(columns, "category_id")
		values = append(values, *(payload.CategoryId))
	}

	sb := sq.Insert("tasks").Columns(columns...).Values(values...).
		Suffix("RETURNING id, user_id, title, description, status, category_id, due_date, due_time")

	var (
		id          string
		userId      string
		title       string
		description string
		status      string
		categoryId  *string
		dueDate     string
		dueTime     string
	)

	sqlQuery, args, err := sb.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return res.InternalErrorHandler(err, "Cannot build query!", c)
	}
	err = db.DB.QueryRow(sqlQuery, args...).
		Scan(&id, &userId, &title, &description, &status, &categoryId, &dueDate, &dueTime)
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
		"userId":      userId,
	}
	return res.ApiResponse(true, "Successfully created the task", data, c)
}

func UpdateTaskAdmin(c *fiber.Ctx) error {
	var payload UpdateTaskPayloadAdmin
	var taskId = c.Params("id")

	if err := c.BodyParser(&payload); err != nil {
		return res.ParsingErrorHandler(err, c)
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return res.ValidationErrorHandler(errMessage, c)
	}

	var userId string
	sql := `SELECT user_id FROM tasks WHERE id=$1`
	err := db.DB.QueryRowContext(context.Background(), sql, taskId).Scan(&userId)

	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}

	sb := sq.Update("tasks").
		Set("title", payload.Title).
		Set("status", payload.Status).
		Set("due_date", payload.DueDate).
		Set("due_time", payload.DueTime).
		Set("description", payload.Description).
		Set("user_id", payload.UserId).
		Where(sq.Eq{"id": taskId}).
		Suffix("RETURNING id, user_id, title, description, status, category_id, due_date, due_time")

	if payload.CategoryId != nil {
		sql := `SELECT id FROM categories WHERE id=$1`
		var placeholder string
		err := db.DB.QueryRow(sql, payload.CategoryId).Scan(&placeholder)

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
		return res.InternalErrorHandler(err, "Cannot build query", c)
	}
	err = db.DB.QueryRow(sqlQuery, args...).
		Scan(&id, &userId, &title, &description, &status, &categoryId, &dueDate, &dueTime)
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
		"userId":      userId,
	}
	return res.ApiResponse(true, "Successfully updated the task", data, c)
}

func DeleteTaskAdmin(c *fiber.Ctx) error {
	var taskId = c.Params("id")

	// Control if task exists
	sql := `SELECT id FROM tasks WHERE id = $1`
	var placeholder string
	err := db.DB.QueryRow(sql, taskId).Scan(&placeholder)
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
		result.Scan(&fileId)
		fileIds = append(fileIds, fileId)
	}

	err = file.RemoveFiles(fileIds)
	if err != nil {
		return res.InternalErrorHandler(err, "An error while fetching task files", c)
	}

	sql = `DELETE FROM tasks WHERE id=$1`

	_, err = db.DB.Exec(sql, taskId)

	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}
	data := &fiber.Map{
		"id": taskId,
	}
	return res.ApiResponse(true, "Successfully deleted the task", data, c)
}

type TaskQueryParamsAdmin struct {
	Id           *string `query:"id" validate:"omitempty,uuid4"`
	StartTime    *string `query:"startTime" validate:"omitempty,datetime=15:04"`
	EndTime      *string `query:"endTime" validate:"omitempty,datetime=15:04"`
	StartDate    *string `query:"startDate" validate:"omitempty,datetime=2006-1-2"`
	EndDate      *string `query:"endDate" validate:"omitempty,datetime=2006-1-2"`
	Status       *string `query:"status" validate:"omitempty,oneof=PENDING IN_PROGRESS COMPLETED CANCELED"`
	CategoryId   *string `query:"categoryId" validate:"omitempty,uuid4"`
	WithCategory *string `query:"withCategory" validate:"omitempty,oneof=false"`
	UserId       *string `query:"userId" validate:"omitempty,uuid4"`
}

func GetTasksAdmin(c *fiber.Ctx) error {

	validate := govalidator.New()

	params := new(TaskQueryParamsAdmin)

	if err := c.QueryParser(params); err != nil {
		return res.ApiResponse(false, fmt.Sprintf("Cannot parse query params: %s", err.Error()), nil, c)
	}

	if err := validate.Struct(params); err != nil {
		return res.ApiResponse(false, fmt.Sprintf("Cannot validate query params: %s", err.Error()), nil, c)
	}

	sb := sq.Select("t.id", "t.title", "t.description", "t.status", "t.category_id",
		"t.due_date", "t.due_time", "t.user_id", "u.name", "u.email").
		From("tasks AS t").
		Join("users AS u ON u.id = t.user_id").
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
	if params.UserId != nil {
		sb = sb.Where(sq.Eq{"user_id": params.UserId})
	}
	if params.CategoryId != nil {
		sb = sb.Where(sq.Eq{"category_id": params.CategoryId})
	}
	if params.WithCategory != nil {
		sb = sb.Where(sq.Eq{"category_id": nil})
	}

	sqlQuery, args, err := sb.PlaceholderFormat(sq.Dollar).ToSql()

	if err != nil {
		return res.InternalErrorHandler(err, "Cannot build query!", c)
	}

	rows, err := db.DB.Query(sqlQuery, args...)

	if err != nil {
		return res.DbErrorHandler(err, "task", sqlQuery, c)

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
			userId      string
			user_name   string
			user_email  string
		)
		err = rows.Scan(&id, &title, &description, &status, &categoryId, &dueDate, &dueTime, &userId,
			&user_name, &user_email)
		if err != nil {
			return res.DbErrorHandler(err, "task", sqlQuery, c)
		}
		tasks = append(tasks, fiber.Map{
			"id":          id,
			"title":       title,
			"description": description,
			"status":      status,
			"categoryId":  categoryId,
			"dueDate":     dueDate,
			"dueTime":     dueTime,
			"userId":      userId,
			"userName":    user_name,
			"userEmail":   user_email,
		})
	}

	return res.ApiResponse(true, "Successfully fetched tasks", tasks, c)
}

func GetTaskDetailsAdmin(c *fiber.Ctx) error {
	taskId := c.Params("id")
	var (
		id          string
		title       string
		description string
		category_id *string
		user_name   string
		user_id     string
		user_email  string
		status      string
		due_date    string
		due_time    string
		files       []fiber.Map
	)

	sql := `SELECT t.id, t.title, t.description, t.category_id,
				   t.status, t.due_date, t.due_time,
				   u.name, u.id, u.email
				   FROM tasks t, users u 
				   WHERE t.user_id = u.id
				   AND t.id = $1`

	err := db.DB.QueryRow(sql, taskId).Scan(&id, &title, &description, &category_id, &status,
		&due_date, &due_time, &user_name, &user_id, &user_email)
	if err != nil {
		return res.DbErrorHandler(err, "task", sql, c)
	}

	sql = `SELECT id, name, task_id, size, upload_date, mimetype
						FROM file WHERE task_id = $1`

	rows, err := db.DB.Query(sql, taskId)
	if err != nil {
		return res.DbErrorHandler(err, "file", sql, c)
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
			return res.DbErrorHandler(err, "file", sql, c)
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
		"userName":    user_name,
		"userId":      user_id,
		"userEmail":   user_email,
	}
	return res.ApiResponse(true, "Successfully fetched task details", data, c)
}
